import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
export declare class VehiclesController {
    private readonly vehiclesService;
    constructor(vehiclesService: VehiclesService);
    findAll(user: any, search?: string, type?: string, status?: string): Promise<({
        movements: {
            id: string;
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
            entryTime: Date;
        }[];
        user: {
            id: string;
            nombre: string;
            apellidos: string;
            documento: string;
            correo: string;
            userType: string;
            status: string;
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
    })[]>;
    findByIdentifier(identifier: string): Promise<{
        movements: ({
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
            operator: {
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
    }>;
    findOne(id: string): Promise<{
        reservations: ({
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
            operator: {
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
    }>;
    create(createVehicleDto: CreateVehicleDto, user: any): Promise<{
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
    }>;
    update(id: string, updateVehicleDto: UpdateVehicleDto, userId: string): Promise<{
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
    }>;
    toggleAuthorization(id: string, status: string, userId: string): Promise<{
        message: string;
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
    }>;
}
