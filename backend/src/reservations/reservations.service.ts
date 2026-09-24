import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: string, userId?: string) {
    const where: any = {};
    if (status) where.estado = status;
    if (userId) where.userId = userId;

    return this.prisma.reservation.findMany({
      where,
      include: {
        user: { select: { id: true, nombre: true, apellidos: true, correo: true, userType: true } },
        vehicle: { select: { id: true, placa: true, type: true, marca: true, modelo: true } },
        space: true,
      },
      orderBy: { horaInicio: 'asc' },
    });
  }

  async create(dto: CreateReservationDto, creatorId: string) {
    const start = new Date(dto.horaInicio);
    const end = new Date(dto.horaFin);
    const date = new Date(dto.fecha);

    if (start >= end) {
      throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin.');
    }

    // 1. Validar usuario
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    if (user.status === 'BLOQUEADO') {
      throw new BadRequestException('No se puede crear la reserva porque el usuario se encuentra BLOQUEADO.');
    }

    // 2. Validar vehículo
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } });
    if (!vehicle) {
      throw new NotFoundException('Vehículo no encontrado.');
    }
    if (vehicle.status !== 'AUTORIZADO') {
      throw new BadRequestException(`El vehículo ${vehicle.placa} NO está autorizado para reservar.`);
    }

    // 3. Validar espacio
    const space = await this.prisma.space.findUnique({ where: { id: dto.spaceId } });
    if (!space) {
      throw new NotFoundException('Espacio de parqueadero no encontrado.');
    }
    if (space.estado === 'MANTENIMIENTO' || space.estado === 'INACTIVO') {
      throw new BadRequestException(`El espacio ${space.codigo} no está disponible por mantenimiento o inactividad.`);
    }

    // 4. Validar solapamiento (Overlap Guard)
    const existingConflict = await this.prisma.reservation.findFirst({
      where: {
        spaceId: dto.spaceId,
        estado: { in: ['CONFIRMADA', 'ACTIVA', 'PENDIENTE'] },
        AND: [
          { horaInicio: { lt: end } },
          { horaFin: { gt: start } },
        ],
      },
    });

    if (existingConflict) {
      throw new ConflictException(
        `La reserva presenta un conflicto de horario con una reserva existente para el espacio ${space.codigo}.`,
      );
    }

    // 5. Crear Reserva y actualizar estado del espacio si es para hoy
    const reservation = await this.prisma.$transaction(async (tx) => {
      const res = await tx.reservation.create({
        data: {
          userId: dto.userId,
          vehicleId: dto.vehicleId,
          spaceId: dto.spaceId,
          fecha: date,
          horaInicio: start,
          horaFin: end,
          estado: 'CONFIRMADA',
          observaciones: dto.observaciones,
        },
        include: {
          user: true,
          vehicle: true,
          space: true,
        },
      });

      // Si la reserva es para el mismo día, marcar espacio como RESERVADO
      await tx.space.update({
        where: { id: dto.spaceId },
        data: { estado: 'RESERVADO' },
      });

      return res;
    });

    // 6. Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId: creatorId,
        accion: 'CREAR_RESERVA',
        entidad: 'Reservation',
        entidadId: reservation.id,
        detalles: `Reserva creada para espacio ${space.codigo} por usuario ${user.nombre} (${vehicle.placa})`,
      },
    });

    return reservation;
  }

  async cancel(id: string, operatorId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { space: true },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const res = await tx.reservation.update({
        where: { id },
        data: { estado: 'CANCELADA' },
      });

      // Si el espacio estaba reservado, devolver a DISPONIBLE si no hay movimientos activos
      const activeMov = await tx.movement.findFirst({
        where: { spaceId: reservation.spaceId, estado: 'DENTRO' },
      });

      if (!activeMov) {
        await tx.space.update({
          where: { id: reservation.spaceId },
          data: { estado: 'DISPONIBLE' },
        });
      }

      return res;
    });

    await this.prisma.auditLog.create({
      data: {
        userId: operatorId,
        accion: 'CANCELAR_RESERVA',
        entidad: 'Reservation',
        entidadId: id,
        detalles: `Reserva ${id} cancelada.`,
      },
    });

    return { message: 'Reserva cancelada exitosamente.', reservation: updated };
  }
}
