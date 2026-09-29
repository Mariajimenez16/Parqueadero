import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TariffsService } from '../tariffs/tariffs.service';
import { RegisterEntryDto } from './dto/register-entry.dto';
import { RegisterExitDto } from './dto/register-exit.dto';

@Injectable()
export class MovementsService {
  constructor(
    private prisma: PrismaService,
    private tariffsService: TariffsService,
  ) {}

  async getActiveMovements() {
    return this.prisma.movement.findMany({
      where: { estado: 'DENTRO' },
      include: {
        vehicle: { include: { user: true } },
        space: true,
        operator: { select: { id: true, nombre: true, apellidos: true } },
      },
      orderBy: { entryTime: 'desc' },
    });
  }

  async getHistory(search?: string, dateFrom?: string, dateTo?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { vehicle: { placa: { contains: search.toUpperCase() } } },
        { user: { nombre: { contains: search } } },
        { user: { apellidos: { contains: search } } },
        { user: { documento: { contains: search } } },
        { space: { codigo: { contains: search.toUpperCase() } } },
      ];
    }

    if (dateFrom || dateTo) {
      where.entryTime = {};
      if (dateFrom) where.entryTime.gte = new Date(dateFrom);
      if (dateTo) where.entryTime.lte = new Date(dateTo);
    }

    return this.prisma.movement.findMany({
      where,
      include: {
        vehicle: true,
        user: { select: { id: true, nombre: true, apellidos: true, documento: true, userType: true } },
        space: true,
        operator: { select: { id: true, nombre: true, apellidos: true } },
        payment: true,
      },
      orderBy: { entryTime: 'desc' },
      take: 200,
    });
  }

  async registerEntry(dto: RegisterEntryDto, operatorId: string) {
    const cleanId = dto.identifier.trim();

    // 1. Identificar vehículo
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        OR: [
          { placa: cleanId.toUpperCase() },
          { qrCodeToken: cleanId },
        ],
      },
      include: { user: true },
    });

    if (!vehicle) {
      throw new NotFoundException(`No se encontró ningún vehículo con la placa o código QR [${cleanId}].`);
    }

    // 2. Validar autorización del vehículo
    if (vehicle.status !== 'AUTORIZADO') {
      throw new BadRequestException(`El vehículo con placa ${vehicle.placa} NO está autorizado para ingresar.`);
    }

    // 3. Validar estado del usuario
    if (vehicle.user.status === 'BLOQUEADO') {
      throw new BadRequestException(
        `No es posible registrar el ingreso. El usuario ${vehicle.user.nombre} ${vehicle.user.apellidos} se encuentra BLOQUEADO.`,
      );
    }
    if (vehicle.user.status === 'INACTIVO') {
      throw new BadRequestException(`El propietario del vehículo se encuentra INACTIVO.`);
    }

    // 4. Validar que no esté ya dentro
    const activeMovement = await this.prisma.movement.findFirst({
      where: {
        vehicleId: vehicle.id,
        estado: 'DENTRO',
      },
    });

    if (activeMovement) {
      throw new ConflictException(
        `No es posible registrar la entrada porque el vehículo ${vehicle.placa} ya se encuentra DENTRO del parqueadero.`,
      );
    }

    // 5. Asignación de Espacio
    let assignedSpace;

    if (dto.spaceId) {
      assignedSpace = await this.prisma.space.findUnique({ where: { id: dto.spaceId } });
      if (!assignedSpace) {
        throw new NotFoundException(`El espacio especificado no existe.`);
      }
      if (assignedSpace.estado !== 'DISPONIBLE') {
        throw new BadRequestException(`El espacio ${assignedSpace.codigo} no está disponible (Estado actual: ${assignedSpace.estado}).`);
      }
    } else {
      // Buscar espacio disponible compatible por tipo de vehículo
      const requiredType = vehicle.type === 'MOTOCICLETA' ? 'MOTOCICLETA' : 'AUTOMOVIL';

      assignedSpace = await this.prisma.space.findFirst({
        where: {
          tipo: requiredType,
          estado: 'DISPONIBLE',
        },
        orderBy: { numero: 'asc' },
      });

      if (!assignedSpace) {
        // Buscar preferencial o cualquier disponible si no hay de auto
        assignedSpace = await this.prisma.space.findFirst({
          where: { estado: 'DISPONIBLE' },
          orderBy: { numero: 'asc' },
        });
      }

      if (!assignedSpace) {
        throw new BadRequestException(`No existen espacios disponibles en el parqueadero para el vehículo de tipo ${vehicle.type}.`);
      }
    }

    // 6. Transacción atómica: Actualizar espacio y crear movimiento
    const movement = await this.prisma.$transaction(async (tx) => {
      await tx.space.update({
        where: { id: assignedSpace.id },
        data: { estado: 'OCUPADO' },
      });

      return tx.movement.create({
        data: {
          vehicleId: vehicle.id,
          userId: vehicle.userId,
          spaceId: assignedSpace.id,
          operatorId: operatorId,
          entryTime: new Date(),
          estado: 'DENTRO',
          observaciones: dto.observaciones || 'Ingreso registrado correctamente',
        },
        include: {
          vehicle: { include: { user: true } },
          space: true,
          operator: { select: { id: true, nombre: true, apellidos: true } },
        },
      });
    });

    // 7. Auditoría
    await this.prisma.auditLog.create({
      data: {
        userId: operatorId,
        accion: 'REGISTRO_ENTRADA',
        entidad: 'Movement',
        entidadId: movement.id,
        detalles: `Entrada registrada para vehículo ${vehicle.placa} en espacio ${assignedSpace.codigo}`,
      },
    });

    return {
      message: `Entrada registrada exitosamente. Espacio asignado: ${assignedSpace.codigo}`,
      movement,
    };
  }

  async registerExit(dto: RegisterExitDto, operatorId: string) {
    const cleanId = dto.identifier.trim();

    // 1. Buscar movimiento activo por Placa, QR o ID de Movimiento
    const movement = await this.prisma.movement.findFirst({
      where: {
        estado: 'DENTRO',
        OR: [
          { id: cleanId },
          { vehicle: { placa: cleanId.toUpperCase() } },
          { vehicle: { qrCodeToken: cleanId } },
        ],
      },
      include: {
        vehicle: { include: { user: true } },
        user: true,
        space: true,
      },
    });

    if (!movement) {
      throw new NotFoundException(
        `No se puede registrar la salida porque no existe una entrada activa para [${cleanId}].`,
      );
    }

    const exitTime = new Date();

    // 2. Obtener tarifa correspondiente
    const tariff = await this.tariffsService.findActiveTariff(
      movement.user.userType,
      movement.vehicle.type,
    );

    // 3. Calcular tarifa en backend
    const feeCalculation = this.tariffsService.calculateFee(
      movement.entryTime,
      exitTime,
      tariff.valorHora,
      tariff.valorMinimo,
      tariff.valorMaximo,
    );

    const invoiceNumber = `FAC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    // 4. Transacción atómica: Liberar espacio, finalizar movimiento, generar cobro pendiente
    const result = await this.prisma.$transaction(async (tx) => {
      // Liberar espacio
      await tx.space.update({
        where: { id: movement.spaceId },
        data: { estado: 'DISPONIBLE' },
      });

      // Actualizar movimiento
      const updatedMovement = await tx.movement.update({
        where: { id: movement.id },
        data: {
          exitTime,
          duracionMinutos: feeCalculation.duracionMinutos,
          estado: 'FINALIZADO',
          observaciones: dto.observaciones || movement.observaciones,
        },
      });

      // Crear obligación de Pago PENDIENTE
      const payment = await tx.payment.create({
        data: {
          movementId: movement.id,
          tariffId: tariff.id || null,
          valorTotal: feeCalculation.valorTotal,
          metodoPago: 'EFECTIVO',
          estado: 'PENDIENTE',
          numeroFactura: invoiceNumber,
        },
      });

      return { updatedMovement, payment };
    });

    // 5. Auditoría
    await this.prisma.auditLog.create({
      data: {
        userId: operatorId,
        accion: 'REGISTRO_SALIDA',
        entidad: 'Movement',
        entidadId: movement.id,
        detalles: `Salida registrada para vehículo ${movement.vehicle.placa}. Duración: ${feeCalculation.duracionMinutos} min. Total a pagar: $${feeCalculation.valorTotal}`,
      },
    });

    return {
      message: `Salida registrada exitosamente. Espacio ${movement.space.codigo} liberado.`,
      summary: {
        placa: movement.vehicle.placa,
        usuario: `${movement.user.nombre} ${movement.user.apellidos}`,
        tipoUsuario: movement.user.userType,
        espacio: movement.space.codigo,
        entryTime: movement.entryTime,
        exitTime,
        duracionMinutos: feeCalculation.duracionMinutos,
        horasFacturables: feeCalculation.horasFacturables,
        valorTotal: feeCalculation.valorTotal,
        paymentId: result.payment.id,
        numeroFactura: invoiceNumber,
      },
    };
  }
}
