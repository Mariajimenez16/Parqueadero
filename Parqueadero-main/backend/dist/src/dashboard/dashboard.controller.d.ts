import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
