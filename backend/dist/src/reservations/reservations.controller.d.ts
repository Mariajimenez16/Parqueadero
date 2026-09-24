import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    findAll(status?: string, userId?: string): Promise<({
        user: {
            id: string;
            nombre: string;
            apellidos: string;
            correo: string;
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
            placa: string;
            type: string;
            marca: string;
            modelo: string;
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
    })[]>;
    create(dto: CreateReservationDto, creatorId: string): Promise<{
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
        observaciones: string | null;
        vehicleId: string;
        spaceId: string;
        fecha: Date;
        horaInicio: Date;
        horaFin: Date;
    }>;
    cancel(id: string, operatorId: string): Promise<{
        message: string;
        reservation: {
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
        };
    }>;
}
