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
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let VehiclesService = class VehiclesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(search, type, status, userId) {
        const where = {};
        if (userId)
            where.userId = userId;
        if (type)
            where.type = type;
        if (status)
            where.status = status;
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Vehículo con ID ${id} no encontrado.`);
        }
        return vehicle;
    }
    async findByIdentifier(identifier) {
        const cleanId = identifier.trim();
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
            throw new common_1.NotFoundException(`No se encontró ningún vehículo con la placa o código QR [${cleanId}].`);
        }
        return vehicle;
    }
    async create(createVehicleDto, operatorId) {
        const placaClean = createVehicleDto.placa.trim().toUpperCase();
        const existing = await this.prisma.vehicle.findUnique({
            where: { placa: placaClean },
        });
        if (existing) {
            throw new common_1.ConflictException(`La placa ${placaClean} ya se encuentra registrada en el sistema.`);
        }
        const owner = await this.prisma.user.findUnique({
            where: { id: createVehicleDto.userId },
        });
        if (!owner) {
            throw new common_1.NotFoundException(`El usuario propietario especificado no existe.`);
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
    async update(id, updateVehicleDto, operatorId) {
        await this.findOne(id);
        const data = { ...updateVehicleDto };
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
    async toggleAuthorization(id, status, operatorId) {
        if (!['AUTORIZADO', 'NO_AUTORIZADO', 'INACTIVO'].includes(status)) {
            throw new common_1.BadRequestException('Estado de autorización inválido.');
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
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map