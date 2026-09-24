import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getOccupancyReport(startDate?: string, endDate?: string): Promise<{
        capacidadTotal: number;
        espaciosOcupados: number;
        espaciosDisponibles: number;
        espaciosReservados: number;
        espaciosMantenimiento: number;
        porcentajeOcupacion: number;
        fechaGeneracion: Date;
    }>;
    getRevenueReport(period?: string, dateFrom?: string, dateTo?: string): Promise<{
        periodo: string;
        totalIngresos: number;
        cantidadPagos: number;
        promedioPago: number;
        distribucionPorTipoUsuario: {
            tipo: string;
            total: number;
        }[];
        distribucionPorMetodoPago: {
            metodo: string;
            total: number;
        }[];
        detalle: {
            factura: string;
            fecha: Date;
            placa: string;
            usuario: string;
            tipoUsuario: string;
            metodo: string;
            monto: number;
        }[];
    }>;
    getPeakHoursReport(): Promise<{
        hora: string;
        ingresos: number;
    }[]>;
    getSpaceUtilizationReport(): Promise<{
        codigo: string;
        tipo: string;
        zona: string;
        estadoActual: string;
        totalUsos: number;
        tiempoTotalMinutos: number;
    }[]>;
}
