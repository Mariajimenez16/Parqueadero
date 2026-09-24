import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        overview: {
            totalEspacios: number;
            disponibles: number;
            ocupados: number;
            reservados: number;
            mantenimiento: number;
            porcentajeOcupacion: number;
            vehiculosDentro: number;
            entradasHoy: number;
            salidasHoy: number;
            ingresosHoy: number;
            pagosPendientesCount: number;
            pagosPendientesMonto: number;
            reservasHoy: number;
        };
        charts: {
            usoPorTipoUsuario: {
                name: string;
                cantidad: number;
            }[];
            flujoPorHoras: any[];
        };
    }>;
}
