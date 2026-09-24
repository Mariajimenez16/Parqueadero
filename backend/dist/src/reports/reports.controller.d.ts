import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getOccupancy(startDate?: string, endDate?: string): Promise<{
        capacidadTotal: number;
        espaciosOcupados: number;
        espaciosDisponibles: number;
        espaciosReservados: number;
        espaciosMantenimiento: number;
        porcentajeOcupacion: number;
        fechaGeneracion: Date;
    }>;
    getRevenue(period?: string, dateFrom?: string, dateTo?: string): Promise<{
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
    getPeakHours(): Promise<{
        hora: string;
        ingresos: number;
    }[]>;
    getSpaceUtilization(): Promise<{
        codigo: string;
        tipo: string;
        zona: string;
        estadoActual: string;
        totalUsos: number;
        tiempoTotalMinutos: number;
    }[]>;
}
