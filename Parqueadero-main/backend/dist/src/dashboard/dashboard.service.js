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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const totalEspacios = await this.prisma.space.count();
        const disponibles = await this.prisma.space.count({ where: { estado: 'DISPONIBLE' } });
        const ocupados = await this.prisma.space.count({ where: { estado: 'OCUPADO' } });
        const reservados = await this.prisma.space.count({ where: { estado: 'RESERVADO' } });
        const mantenimiento = await this.prisma.space.count({ where: { estado: 'MANTENIMIENTO' } });
        const porcentajeOcupacion = totalEspacios > 0 ? Math.round((ocupados / totalEspacios) * 100) : 0;
        const vehiculosDentro = await this.prisma.movement.count({ where: { estado: 'DENTRO' } });
        const entradasHoy = await this.prisma.movement.count({
            where: { entryTime: { gte: todayStart, lte: todayEnd } },
        });
        const salidasHoy = await this.prisma.movement.count({
            where: { exitTime: { gte: todayStart, lte: todayEnd } },
        });
        const reservasHoy = await this.prisma.reservation.count({
            where: { fecha: { gte: todayStart, lte: todayEnd } },
        });
        const pagosExitososHoy = await this.prisma.payment.findMany({
            where: {
                estado: 'PAGADO',
                fechaPago: { gte: todayStart, lte: todayEnd },
            },
            select: { valorTotal: true },
        });
        const ingresosHoy = pagosExitososHoy.reduce((sum, p) => sum + p.valorTotal, 0);
        const pagosPendientesList = await this.prisma.payment.findMany({
            where: { estado: 'PENDIENTE' },
            select: { valorTotal: true },
        });
        const pagosPendientesCount = pagosPendientesList.length;
        const pagosPendientesMonto = pagosPendientesList.reduce((sum, p) => sum + p.valorTotal, 0);
        const movimientosHoy = await this.prisma.movement.findMany({
            where: { entryTime: { gte: todayStart } },
            include: { user: true },
        });
        const userTypeMap = {
            ESTUDIANTE: 0,
            DOCENTE: 0,
            ADMINISTRATIVO: 0,
            VISITANTE: 0,
        };
        movimientosHoy.forEach((m) => {
            const type = m.user?.userType || 'VISITANTE';
            userTypeMap[type] = (userTypeMap[type] || 0) + 1;
        });
        const usoPorTipoUsuario = Object.entries(userTypeMap).map(([name, val]) => ({
            name,
            cantidad: val,
        }));
        const hourlyFlow = [];
        for (let h = 7; h <= 20; h++) {
            const hourStart = new Date(todayStart);
            hourStart.setHours(h, 0, 0, 0);
            const hourEnd = new Date(todayStart);
            hourEnd.setHours(h, 59, 59, 999);
            const entradas = await this.prisma.movement.count({
                where: { entryTime: { gte: hourStart, lte: hourEnd } },
            });
            const salidas = await this.prisma.movement.count({
                where: { exitTime: { gte: hourStart, lte: hourEnd } },
            });
            hourlyFlow.push({
                hora: `${h}:00`,
                entradas,
                salidas,
            });
        }
        return {
            overview: {
                totalEspacios,
                disponibles,
                ocupados,
                reservados,
                mantenimiento,
                porcentajeOcupacion,
                vehiculosDentro,
                entradasHoy,
                salidasHoy,
                ingresosHoy,
                pagosPendientesCount,
                pagosPendientesMonto,
                reservasHoy,
            },
            charts: {
                usoPorTipoUsuario,
                flujoPorHoras: hourlyFlow,
            },
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map