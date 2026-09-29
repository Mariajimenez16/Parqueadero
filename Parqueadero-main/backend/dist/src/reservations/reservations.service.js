"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReservationsService = class ReservationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(status, userId) {
        const where = {};
        if (status)
            where.estado = status;
        if (userId)
            where.userId = userId;
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
    async create(dto, creatorId) {
        const start = new Date(dto.horaInicio);
        const end = new Date(dto.horaFin);
        const date = new Date(dto.fecha);
        if (start >= end) {
            throw new common_1.BadRequestException('La hora de inicio debe ser anterior a la hora de fin.');
        }
        const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado.');
        }
        if (user.status === 'BLOQUEADO') {
            throw new common_1.BadRequestException('No se puede crear la reserva porque el usuario se encuentra BLOQUEADO.');
        }
        const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } });
        if (!vehicle) {
            throw new common_1.NotFoundException('Vehículo no encontrado.');
        }
        if (vehicle.status !== 'AUTORIZADO') {
            throw new common_1.BadRequestException(`El vehículo ${vehicle.placa} NO está autorizado para reservar.`);
        }
        const space = await this.prisma.space.findUnique({ where: { id: dto.spaceId } });
        if (!space) {
            throw new common_1.NotFoundException('Espacio de parqueadero no encontrado.');
        }
        if (space.estado === 'MANTENIMIENTO' || space.estado === 'INACTIVO') {
            throw new common_1.BadRequestException(`El espacio ${space.codigo} no está disponible por mantenimiento o inactividad.`);
        }
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
            throw new common_1.ConflictException(`La reserva presenta un conflicto de horario con una reserva existente para el espacio ${space.codigo}.`);
        }
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
            await tx.space.update({
                where: { id: dto.spaceId },
                data: { estado: 'RESERVADO' },
            });
            return res;
        });
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
    async cancel(id, operatorId) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id },
            include: { space: true },
        });
        if (!reservation) {
            throw new common_1.NotFoundException('Reserva no encontrada.');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const res = await tx.reservation.update({
                where: { id },
                data: { estado: 'CANCELADA' },
            });
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
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map