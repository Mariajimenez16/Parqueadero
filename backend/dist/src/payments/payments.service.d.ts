import { PrismaService } from '../prisma/prisma.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    getPendingPayments(search?: string): Promise<({
        tariff: {
            id: string;
            userType: string;
            createdAt: Date;
            updatedAt: Date;
            vehicleType: string;
            valorHora: number;
            valorMinimo: number;
            valorMaximo: number | null;
            estado: boolean;
            fechaVigencia: Date;
        };
        movement: {
            user: {
                id: string;
                nombre: string;
                apellidos: string;
                documento: string;
                userType: string;
            };
            space: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                estado: string;
                codigo: string;
                numero: number;
                tipo: string;
                zona: string;
            };
            vehicle: {
                id: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                placa: string;
                type: string;
                marca: string;
                modelo: string;
                color: string;
                qrCodeToken: string;
                userId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            estado: string;
            userId: string;
            entryTime: Date;
            exitTime: Date | null;
            duracionMinutos: number | null;
            observaciones: string | null;
            vehicleId: string;
            spaceId: string;
            operatorId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        estado: string;
        valorTotal: number;
        metodoPago: string;
        numeroFactura: string;
        fechaPago: Date | null;
        movementId: string;
        tariffId: string | null;
        cashierId: string | null;
    })[]>;
    getPaymentHistory(search?: string, dateFrom?: string, dateTo?: string): Promise<({
        tariff: {
            id: string;
            userType: string;
            createdAt: Date;
            updatedAt: Date;
            vehicleType: string;
            valorHora: number;
            valorMinimo: number;
            valorMaximo: number | null;
            estado: boolean;
            fechaVigencia: Date;
        };
        movement: {
            user: {
                id: string;
                nombre: string;
                apellidos: string;
                documento: string;
                userType: string;
            };
            space: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                estado: string;
                codigo: string;
                numero: number;
                tipo: string;
                zona: string;
            };
            vehicle: {
                id: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                placa: string;
                type: string;
                marca: string;
                modelo: string;
                color: string;
                qrCodeToken: string;
                userId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            estado: string;
            userId: string;
            entryTime: Date;
            exitTime: Date | null;
            duracionMinutos: number | null;
            observaciones: string | null;
            vehicleId: string;
            spaceId: string;
            operatorId: string;
        };
        cashier: {
            id: string;
            nombre: string;
            apellidos: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        estado: string;
        valorTotal: number;
        metodoPago: string;
        numeroFactura: string;
        fechaPago: Date | null;
        movementId: string;
        tariffId: string | null;
        cashierId: string | null;
    })[]>;
    processPayment(id: string, dto: ProcessPaymentDto, cashierId: string): Promise<{
        message: string;
        receipt: {
            institucion: string;
            nit: string;
            direccion: string;
            telefono: string;
            numeroFactura: any;
            fechaEmision: any;
            estadoPago: any;
            metodoPago: any;
            usuario: {
                nombreCompleto: string;
                documento: any;
                tipoUsuario: any;
                correo: any;
            };
            vehiculo: {
                placa: any;
                tipo: any;
                marca: any;
                modelo: any;
                color: any;
            };
            movimiento: {
                espacio: any;
                zona: any;
                horaEntrada: any;
                horaSalida: any;
                duracionMinutos: any;
                horasFacturables: number;
            };
            tarifa: {
                valorHora: any;
                valorMinimo: any;
            };
            valorTotal: any;
            cajero: string;
        };
    }>;
    getReceiptData(id: string): Promise<{
        institucion: string;
        nit: string;
        direccion: string;
        telefono: string;
        numeroFactura: any;
        fechaEmision: any;
        estadoPago: any;
        metodoPago: any;
        usuario: {
            nombreCompleto: string;
            documento: any;
            tipoUsuario: any;
            correo: any;
        };
        vehiculo: {
            placa: any;
            tipo: any;
            marca: any;
            modelo: any;
            color: any;
        };
        movimiento: {
            espacio: any;
            zona: any;
            horaEntrada: any;
            horaSalida: any;
            duracionMinutos: any;
            horasFacturables: number;
        };
        tarifa: {
            valorHora: any;
            valorMinimo: any;
        };
        valorTotal: any;
        cajero: string;
    }>;
    private formatReceiptData;
}
