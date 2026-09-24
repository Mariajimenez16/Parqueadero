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
exports.SpacesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SpacesService = class SpacesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(zona, estado, tipo) {
        const where = {};
        if (zona)
            where.zona = zona;
        if (estado)
            where.estado = estado;
        if (tipo)
            where.tipo = tipo;
        const spaces = await this.prisma.space.findMany({
            where,
            include: {
                movements: {
                    where: { estado: 'DENTRO' },
                    include: {
                        vehicle: { include: { user: true } },
                    },
                },
                reservations: {
                    where: { estado: 'CONFIRMADA' },
                    take: 1,
                    include: { user: true, vehicle: true },
                },
            },
            orderBy: [{ zona: 'asc' }, { numero: 'asc' }],
        });
        return spaces;
    }
    async getMapSummary() {
        const total = await this.prisma.space.count();
        const disponibles = await this.prisma.space.count({ where: { estado: 'DISPONIBLE' } });
        const ocupados = await this.prisma.space.count({ where: { estado: 'OCUPADO' } });
        const reservados = await this.prisma.space.count({ where: { estado: 'RESERVADO' } });
        const mantenimiento = await this.prisma.space.count({ where: { estado: 'MANTENIMIENTO' } });
        const porcentajeOcupacion = total > 0 ? Math.round((ocupados / total) * 100) : 0;
        return {
            total,
            disponibles,
            ocupados,
            reservados,
            mantenimiento,
            porcentajeOcupacion,
        };
    }
    async create(createSpaceDto, adminId) {
        const codigoClean = createSpaceDto.codigo.trim().toUpperCase();
        const existing = await this.prisma.space.findUnique({
            where: { codigo: codigoClean },
        });
        if (existing) {
            throw new common_1.ConflictException(`El código de espacio ${codigoClean} ya existe.`);
        }
        const space = await this.prisma.space.create({
            data: {
                codigo: codigoClean,
                numero: createSpaceDto.numero,
                tipo: createSpaceDto.tipo || 'AUTOMOVIL',
                zona: createSpaceDto.zona.trim(),
                estado: createSpaceDto.estado || 'DISPONIBLE',
            },
        });
        if (adminId) {
            await this.prisma.auditLog.create({
                data: {
                    userId: adminId,
                    accion: 'CREAR_ESPACIO',
                    entidad: 'Space',
                    entidadId: space.id,
                    detalles: `Espacio ${space.codigo} (${space.tipo}) creado en ${space.zona}`,
                },
            });
        }
        return space;
    }
    async updateState(id, estado, adminId) {
        const space = await this.prisma.space.findUnique({ where: { id } });
        if (!space) {
            throw new common_1.NotFoundException(`Espacio no encontrado.`);
        }
        const updated = await this.prisma.space.update({
            where: { id },
            data: { estado },
        });
        if (adminId) {
            await this.prisma.auditLog.create({
                data: {
                    userId: adminId,
                    accion: 'CAMBIO_ESTADO_ESPACIO',
                    entidad: 'Space',
                    entidadId: id,
                    detalles: `Estado del espacio ${updated.codigo} cambiado de ${space.estado} a ${estado}`,
                },
            });
        }
        return updated;
    }
};
exports.SpacesService = SpacesService;
exports.SpacesService = SpacesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SpacesService);
//# sourceMappingURL=spaces.service.js.map