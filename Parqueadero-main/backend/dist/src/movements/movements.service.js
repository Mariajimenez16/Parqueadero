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
exports.MovementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tariffs_service_1 = require("../tariffs/tariffs.service");
let MovementsService = class MovementsService {
    constructor(prisma, tariffsService) {
        this.prisma = prisma;
        this.tariffsService = tariffsService;
    }
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
    async getHistory(search, dateFrom, dateTo) {
        const where = {};
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
            if (dateFrom)
                where.entryTime.gte = new Date(dateFrom);
            if (dateTo)
                where.entryTime.lte = new Date(dateTo);
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
    async registerEntry(dto, operatorId) {
        const cleanId = dto.identifier.trim();
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
            throw new common_1.NotFoundException(`No se encontró ningún vehículo con la placa o código QR [${cleanId}].`);
        }
        if (vehicle.status !== 'AUTORIZADO') {
            throw new common_1.BadRequestException(`El vehículo con placa ${vehicle.placa} NO está autorizado para ingresar.`);
        }
        if (vehicle.user.status === 'BLOQUEADO') {
            throw new common_1.BadRequestException(`No es posible registrar el ingreso. El usuario ${vehicle.user.nombre} ${vehicle.user.apellidos} se encuentra BLOQUEADO.`);
        }
        if (vehicle.user.status === 'INACTIVO') {
            throw new common_1.BadRequestException(`El propietario del vehículo se encuentra INACTIVO.`);
        }
        const activeMovement = await this.prisma.movement.findFirst({
            where: {
                vehicleId: vehicle.id,
                estado: 'DENTRO',
            },
        });
        if (activeMovement) {
            throw new common_1.ConflictException(`No es posible registrar la entrada porque el vehículo ${vehicle.placa} ya se encuentra DENTRO del parqueadero.`);
        }
        let assignedSpace;
        if (dto.spaceId) {
            assignedSpace = await this.prisma.space.findUnique({ where: { id: dto.spaceId } });
            if (!assignedSpace) {
                throw new common_1.NotFoundException(`El espacio especificado no existe.`);
            }
            if (assignedSpace.estado !== 'DISPONIBLE') {
                throw new common_1.BadRequestException(`El espacio ${assignedSpace.codigo} no está disponible (Estado actual: ${assignedSpace.estado}).`);
            }
        }
        else {
            const requiredType = vehicle.type === 'MOTOCICLETA' ? 'MOTOCICLETA' : 'AUTOMOVIL';
            assignedSpace = await this.prisma.space.findFirst({
                where: {
                    tipo: requiredType,
                    estado: 'DISPONIBLE',
                },
                orderBy: { numero: 'asc' },
            });
            if (!assignedSpace) {
                assignedSpace = await this.prisma.space.findFirst({
                    where: { estado: 'DISPONIBLE' },
                    orderBy: { numero: 'asc' },
                });
            }
            if (!assignedSpace) {
                throw new common_1.BadRequestException(`No existen espacios disponibles en el parqueadero para el vehículo de tipo ${vehicle.type}.`);
            }
        }
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
    async registerExit(dto, operatorId) {
        const cleanId = dto.identifier.trim();
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
            throw new common_1.NotFoundException(`No se puede registrar la salida porque no existe una entrada activa para [${cleanId}].`);
        }
        const exitTime = new Date();
        const tariff = await this.tariffsService.findActiveTariff(movement.user.userType, movement.vehicle.type);
        const feeCalculation = this.tariffsService.calculateFee(movement.entryTime, exitTime, tariff.valorHora, tariff.valorMinimo, tariff.valorMaximo);
        const invoiceNumber = `FAC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const result = await this.prisma.$transaction(async (tx) => {
            await tx.space.update({
                where: { id: movement.spaceId },
                data: { estado: 'DISPONIBLE' },
            });
            const updatedMovement = await tx.movement.update({
                where: { id: movement.id },
                data: {
                    exitTime,
                    duracionMinutos: feeCalculation.duracionMinutos,
                    estado: 'FINALIZADO',
                    observaciones: dto.observaciones || movement.observaciones,
                },
            });
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
};
exports.MovementsService = MovementsService;
exports.MovementsService = MovementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tariffs_service_1.TariffsService])
], MovementsService);
//# sourceMappingURL=movements.service.js.map