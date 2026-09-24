import { TariffsService } from './tariffs.service';
import { CreateTariffDto } from './dto/create-tariff.dto';
export declare class TariffsController {
    private readonly tariffsService;
    constructor(tariffsService: TariffsService);
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
    create(createTariffDto: CreateTariffDto, adminId: string): Promise<{
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
    update(id: string, updateDto: Partial<CreateTariffDto>, adminId: string): Promise<{
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
