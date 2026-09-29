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
exports.TariffsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TariffsService = class TariffsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.tariff.findMany({
            orderBy: [{ userType: 'asc' }, { vehicleType: 'asc' }],
        });
    }
    async findOne(id) {
        const tariff = await this.prisma.tariff.findUnique({ where: { id } });
        if (!tariff) {
            throw new common_1.NotFoundException(`Tarifa con ID ${id} no encontrada.`);
        }
        return tariff;
    }
    async findActiveTariff(userType, vehicleType) {
        const tariff = await this.prisma.tariff.findFirst({
            where: {
                userType,
                vehicleType,
                estado: true,
            },
        });
        if (!tariff) {
            const defaultTariff = await this.prisma.tariff.findFirst({
                where: { userType: 'VISITANTE', vehicleType: 'AUTOMOVIL', estado: true },
            });
            return defaultTariff || { valorHora: 3000, valorMinimo: 2000, valorMaximo: 20000, id: null };
        }
        return tariff;
    }
    calculateFee(entryTime, exitTime, valorHora, valorMinimo, valorMaximo) {
        const duracionMs = Math.max(0, exitTime.getTime() - entryTime.getTime());
        const duracionMinutos = Math.max(1, Math.ceil(duracionMs / 60000));
        const horasFacturables = Math.ceil(duracionMinutos / 60);
        let valorTotal = horasFacturables * valorHora;
        valorTotal = Math.max(valorMinimo, valorTotal);
        if (valorMaximo && valorMaximo > 0) {
            valorTotal = Math.min(valorTotal, valorMaximo);
        }
        return {
            duracionMinutos,
            horasFacturables,
            valorTotal: Math.round(valorTotal * 100) / 100,
        };
    }
    async create(createTariffDto, adminId) {
        const existing = await this.prisma.tariff.findUnique({
            where: {
                userType_vehicleType: {
                    userType: createTariffDto.userType,
                    vehicleType: createTariffDto.vehicleType,
                },
            },
        });
        if (existing) {
            return this.update(existing.id, createTariffDto, adminId);
        }
        const tariff = await this.prisma.tariff.create({
            data: {
                userType: createTariffDto.userType,
                vehicleType: createTariffDto.vehicleType,
                valorHora: createTariffDto.valorHora,
                valorMinimo: createTariffDto.valorMinimo,
                valorMaximo: createTariffDto.valorMaximo || null,
                estado: createTariffDto.estado !== undefined ? createTariffDto.estado : true,
            },
        });
        if (adminId) {
            await this.prisma.auditLog.create({
                data: {
                    userId: adminId,
                    accion: 'CREAR_TARIFA',
                    entidad: 'Tariff',
                    entidadId: tariff.id,
                    detalles: `Tarifa para ${tariff.userType} - ${tariff.vehicleType} creada ($${tariff.valorHora}/hora)`,
                },
            });
        }
        return tariff;
    }
    async update(id, updateDto, adminId) {
        await this.findOne(id);
        const updated = await this.prisma.tariff.update({
            where: { id },
            data: updateDto,
        });
        if (adminId) {
            await this.prisma.auditLog.create({
                data: {
                    userId: adminId,
                    accion: 'MODIFICAR_TARIFA',
                    entidad: 'Tariff',
                    entidadId: id,
                    detalles: `Tarifa ${updated.userType}-${updated.vehicleType} modificada a $${updated.valorHora}/hora (Min: $${updated.valorMinimo})`,
                },
            });
        }
        return updated;
    }
};
exports.TariffsService = TariffsService;
exports.TariffsService = TariffsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TariffsService);
//# sourceMappingURL=tariffs.service.js.map