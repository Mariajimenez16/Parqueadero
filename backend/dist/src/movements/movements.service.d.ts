import { PrismaService } from '../prisma/prisma.service';
import { TariffsService } from '../tariffs/tariffs.service';
import { RegisterEntryDto } from './dto/register-entry.dto';
import { RegisterExitDto } from './dto/register-exit.dto';
export declare class MovementsService {
    private prisma;
    private tariffsService;
    constructor(prisma: PrismaService, tariffsService: TariffsService);
    getActiveMovements(): Promise<({
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
            user: {
                id: string;
                nombre: string;
                apellidos: string;
                documento: string;
                correo: string;
                telefono: string;
                passwordHash: string;
                userType: string;
                role: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
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
        operator: {
            id: string;
            nombre: string;
            apellidos: string;
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
    })[]>;
    getHistory(search?: string, dateFrom?: string, dateTo?: string): Promise<({
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
        operator: {
            id: string;
            nombre: string;
            apellidos: string;
        };
        payment: {
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
    })[]>;
    registerEntry(dto: RegisterEntryDto, operatorId: string): Promise<{
        message: string;
        movement: {
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
                user: {
                    id: string;
                    nombre: string;
                    apellidos: string;
                    documento: string;
                    correo: string;
                    telefono: string;
                    passwordHash: string;
                    userType: string;
                    role: string;
                    status: string;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
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
            operator: {
                id: string;
                nombre: string;
                apellidos: string;
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
    }>;
    registerExit(dto: RegisterExitDto, operatorId: string): Promise<{
        message: string;
        summary: {
            placa: string;
            usuario: string;
            tipoUsuario: string;
            espacio: string;
            entryTime: Date;
            exitTime: Date;
            duracionMinutos: number;
            horasFacturables: number;
            valorTotal: number;
            paymentId: string;
            numeroFactura: string;
        };
    }>;
}
