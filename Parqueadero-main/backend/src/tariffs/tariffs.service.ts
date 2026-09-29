import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTariffDto } from './dto/create-tariff.dto';

@Injectable()
export class TariffsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tariff.findMany({
      orderBy: [{ userType: 'asc' }, { vehicleType: 'asc' }],
    });
  }

  async findOne(id: string) {
    const tariff = await this.prisma.tariff.findUnique({ where: { id } });
    if (!tariff) {
      throw new NotFoundException(`Tarifa con ID ${id} no encontrada.`);
    }
    return tariff;
  }

  async findActiveTariff(userType: string, vehicleType: string) {
    const tariff = await this.prisma.tariff.findFirst({
      where: {
        userType,
        vehicleType,
        estado: true,
      },
    });

    if (!tariff) {
      // Fallback a tarifa por defecto si no está explícitamente configurada
      const defaultTariff = await this.prisma.tariff.findFirst({
        where: { userType: 'VISITANTE', vehicleType: 'AUTOMOVIL', estado: true },
      });
      return defaultTariff || { valorHora: 3000, valorMinimo: 2000, valorMaximo: 20000, id: null };
    }

    return tariff;
  }

  calculateFee(entryTime: Date, exitTime: Date, valorHora: number, valorMinimo: number, valorMaximo?: number | null) {
    const duracionMs = Math.max(0, exitTime.getTime() - entryTime.getTime());
    const duracionMinutos = Math.max(1, Math.ceil(duracionMs / 60000));
    
    // Cálculo de horas completas o fracciones redondeadas hacia arriba
    const horasFacturables = Math.ceil(duracionMinutos / 60);
    
    let valorTotal = horasFacturables * valorHora;
    
    // Aplicar valor mínimo
    valorTotal = Math.max(valorMinimo, valorTotal);
    
    // Aplicar valor máximo si aplica
    if (valorMaximo && valorMaximo > 0) {
      valorTotal = Math.min(valorTotal, valorMaximo);
    }

    return {
      duracionMinutos,
      horasFacturables,
      valorTotal: Math.round(valorTotal * 100) / 100,
    };
  }

  async create(createTariffDto: CreateTariffDto, adminId?: string) {
    const existing = await this.prisma.tariff.findUnique({
      where: {
        userType_vehicleType: {
          userType: createTariffDto.userType,
          vehicleType: createTariffDto.vehicleType,
        },
      },
    });

    if (existing) {
      // Actualizar si ya existe
      return this.update(existing.id, createTariffDto, adminId);
    }

    const tariff = await this.prisma.tariff.create({
      data: {
        userType: createTariffDto.userType,
        vehicleType: createTariffDto.vehicleType,
        valorHora: createTariffDto.valorHora,
        valorMinimo: createTariffDto.valorMinimo,
        valorMaximo: createTariffDto.valorMaximo || null,
        estado: createTariffDto.estado !== undefined ? createTariffDto.estado : true,
      },
    });

    if (adminId) {
      await this.prisma.auditLog.create({
        data: {
          userId: adminId,
          accion: 'CREAR_TARIFA',
          entidad: 'Tariff',
          entidadId: tariff.id,
          detalles: `Tarifa para ${tariff.userType} - ${tariff.vehicleType} creada ($${tariff.valorHora}/hora)`,
        },
      });
    }

    return tariff;
  }

  async update(id: string, updateDto: Partial<CreateTariffDto>, adminId?: string) {
    await this.findOne(id);

    const updated = await this.prisma.tariff.update({
      where: { id },
      data: updateDto,
    });

    if (adminId) {
      await this.prisma.auditLog.create({
        data: {
          userId: adminId,
          accion: 'MODIFICAR_TARIFA',
          entidad: 'Tariff',
          entidadId: id,
          detalles: `Tarifa ${updated.userType}-${updated.vehicleType} modificada a $${updated.valorHora}/hora (Min: $${updated.valorMinimo})`,
        },
      });
    }

    return updated;
  }
}
