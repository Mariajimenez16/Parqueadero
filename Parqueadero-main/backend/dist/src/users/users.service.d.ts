import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(search?: string, role?: string, status?: string): Promise<{
        id: string;
        nombre: string;
        apellidos: string;
        documento: string;
        correo: string;
        telefono: string;
        userType: string;
        role: string;
        status: string;
        createdAt: Date;
        vehicles: {
            id: string;
            status: string;
            placa: string;
            type: string;
            marca: string;
        }[];
    }[]>;
    findOne(id: string): Promise<{
        vehicles: {
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
        }[];
        reservations: {
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
        }[];
        movements: {
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
        }[];
        id: string;
        nombre: string;
        apellidos: string;
        documento: string;
        correo: string;
        telefono: string;
        userType: string;
        role: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(createUserDto: CreateUserDto, adminId?: string): Promise<{
        id: string;
        nombre: string;
        apellidos: string;
        documento: string;
        correo: string;
        telefono: string;
        userType: string;
        role: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, adminId?: string): Promise<{
        id: string;
        nombre: string;
        apellidos: string;
        documento: string;
        correo: string;
        telefono: string;
        userType: string;
        role: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    changeStatus(id: string, status: string, adminId?: string): Promise<{
        message: string;
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
    }>;
}
