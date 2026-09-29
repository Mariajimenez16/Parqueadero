import { PrismaService } from '../prisma/prisma.service';
import { CreateSpaceDto } from './dto/create-space.dto';
export declare class SpacesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(zona?: string, estado?: string, tipo?: string): Promise<({
        reservations: ({
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
            observaciones: string | null;
            vehicleId: string;
            spaceId: string;
            fecha: Date;
            horaInicio: Date;
            horaFin: Date;
        })[];
        movements: ({
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
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        estado: string;
        codigo: string;
        numero: number;
        tipo: string;
        zona: string;
    })[]>;
    getMapSummary(): Promise<{
        total: number;
        disponibles: number;
        ocupados: number;
        reservados: number;
        mantenimiento: number;
        porcentajeOcupacion: number;
    }>;
    create(createSpaceDto: CreateSpaceDto, adminId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        estado: string;
        codigo: string;
        numero: number;
        tipo: string;
        zona: string;
    }>;
    updateState(id: string, estado: string, adminId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        estado: string;
        codigo: string;
        numero: number;
        tipo: string;
        zona: string;
    }>;
}
