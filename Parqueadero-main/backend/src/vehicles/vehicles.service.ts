import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, type?: string, status?: string, userId?: string) {
    const where: any = {};

    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { placa: { contains: search.toUpperCase() } },
        { marca: { contains: search } },
        { modelo: { contains: search } },
        { color: { contains: search } },
        { user: { nombre: { contains: search } } },
        { user: { apellidos: { contains: search } } },
        { user: { documento: { contains: search } } },
      ];
    }

    return this.prisma.vehicle.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            documento: true,
            correo: true,
            userType: true,
            status: true,
          },
        },
        movements: {
          where: { estado: 'DENTRO' },
          select: { id: true, entryTime: true, space: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        user: true,
        movements: {
          take: 10,
          orderBy: { entryTime: 'desc' },
          include: { space: true, operator: true },
        },
        reservations: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { space: true },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehículo con ID ${id} no encontrado.`);
    }

    return vehicle;
  }

  async findByIdentifier(identifier: string) {
    const cleanId = identifier.trim();

    // Búsqueda por Placa o por QR Code Token
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        OR: [
          { placa: cleanId.toUpperCase() },
          { qrCodeToken: cleanId },
        ],
      },
      include: {
        user: true,
        movements: {
          where: { estado: 'DENTRO' },
          include: { space: true, operator: true },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`No se encontró ningún vehículo con la placa o código QR [${cleanId}].`);
    }

    return vehicle;
  }

  async create(createVehicleDto: CreateVehicleDto, operatorId?: string) {
    const placaClean = createVehicleDto.placa.trim().toUpperCase();

    const existing = await this.prisma.vehicle.findUnique({
      where: { placa: placaClean },
    });
    if (existing) {
      throw new ConflictException(`La placa ${placaClean} ya se encuentra registrada en el sistema.`);
    }

    // Validar usuario existente
    const owner = await this.prisma.user.findUnique({
      where: { id: createVehicleDto.userId },
    });
    if (!owner) {
      throw new NotFoundException(`El usuario propietario especificado no existe.`);
    }

    const qrToken = `QR-${placaClean}-${Date.now().toString(36).toUpperCase()}`;

    const vehicle = await this.prisma.vehicle.create({
      data: {
        placa: placaClean,
        type: createVehicleDto.type || 'AUTOMOVIL',
        marca: createVehicleDto.marca.trim(),
        modelo: createVehicleDto.modelo.trim(),
        color: createVehicleDto.color.trim(),
        qrCodeToken: qrToken,
        status: createVehicleDto.status || 'AUTORIZADO',
        userId: createVehicleDto.userId,
      },
      include: { user: true },
    });

    if (operatorId) {
      await this.prisma.auditLog.create({
        data: {
          userId: operatorId,
          accion: 'REGISTRAR_VEHICULO',
          entidad: 'Vehicle',
          entidadId: vehicle.id,
          detalles: `Vehículo con placa ${vehicle.placa} registrado para el usuario ${owner.nombre} ${owner.apellidos}`,
        },
      });
    }

    return vehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto, operatorId?: string) {
    await this.findOne(id);

    const data: any = { ...updateVehicleDto };
    if (updateVehicleDto.placa) {
      data.placa = updateVehicleDto.placa.trim().toUpperCase();
    }

    const updated = await this.prisma.vehicle.update({
      where: { id },
      data,
      include: { user: true },
    });

    if (operatorId) {
      await this.prisma.auditLog.create({
        data: {
          userId: operatorId,
          accion: 'ACTUALIZAR_VEHICULO',
          entidad: 'Vehicle',
          entidadId: id,
          detalles: `Vehículo con placa ${updated.placa} actualizado`,
        },
      });
    }

    return updated;
  }

  async toggleAuthorization(id: string, status: string, operatorId?: string) {
    if (!['AUTORIZADO', 'NO_AUTORIZADO', 'INACTIVO'].includes(status)) {
      throw new BadRequestException('Estado de autorización inválido.');
    }

    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: { status },
      include: { user: true },
    });

    if (operatorId) {
      await this.prisma.auditLog.create({
        data: {
          userId: operatorId,
          accion: status === 'AUTORIZADO' ? 'AUTORIZAR_VEHICULO' : 'REVOCAR_AUTORIZACION_VEHICULO',
          entidad: 'Vehicle',
          entidadId: id,
          detalles: `Autorización del vehículo ${vehicle.placa} cambiada a ${status}`,
        },
      });
    }

    return { message: `Estado de autorización de ${vehicle.placa} cambiado a ${status}.`, vehicle };
  }
}
