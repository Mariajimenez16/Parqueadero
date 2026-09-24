import { PrismaService } from '../prisma/prisma.service';
import { CreateTariffDto } from './dto/create-tariff.dto';
export declare class TariffsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
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
    }>;
    findActiveTariff(userType: string, vehicleType: string): Promise<{
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
    } | {
        valorHora: number;
        valorMinimo: number;
        valorMaximo: number;
        id: any;
    }>;
    calculateFee(entryTime: Date, exitTime: Date, valorHora: number, valorMinimo: number, valorMaximo?: number | null): {
        duracionMinutos: number;
        horasFacturables: number;
        valorTotal: number;
    };
    create(createTariffDto: CreateTariffDto, adminId?: string): Promise<{
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
    }>;
    update(id: string, updateDto: Partial<CreateTariffDto>, adminId?: string): Promise<{
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
    }>;
}
