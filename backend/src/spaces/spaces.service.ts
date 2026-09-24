import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpaceDto } from './dto/create-space.dto';

@Injectable()
export class SpacesService {
  constructor(private prisma: PrismaService) {}

  async findAll(zona?: string, estado?: string, tipo?: string) {
    const where: any = {};
    if (zona) where.zona = zona;
    if (estado) where.estado = estado;
    if (tipo) where.tipo = tipo;

    const spaces = await this.prisma.space.findMany({
      where,
      include: {
        movements: {
          where: { estado: 'DENTRO' },
          include: {
            vehicle: { include: { user: true } },
          },
        },
        reservations: {
          where: { estado: 'CONFIRMADA' },
          take: 1,
          include: { user: true, vehicle: true },
        },
      },
      orderBy: [{ zona: 'asc' }, { numero: 'asc' }],
    });

    return spaces;
  }

  async getMapSummary() {
    const total = await this.prisma.space.count();
    const disponibles = await this.prisma.space.count({ where: { estado: 'DISPONIBLE' } });
    const ocupados = await this.prisma.space.count({ where: { estado: 'OCUPADO' } });
    const reservados = await this.prisma.space.count({ where: { estado: 'RESERVADO' } });
    const mantenimiento = await this.prisma.space.count({ where: { estado: 'MANTENIMIENTO' } });

    const porcentajeOcupacion = total > 0 ? Math.round((ocupados / total) * 100) : 0;

    return {
      total,
      disponibles,
      ocupados,
      reservados,
      mantenimiento,
      porcentajeOcupacion,
    };
  }

  async create(createSpaceDto: CreateSpaceDto, adminId?: string) {
    const codigoClean = createSpaceDto.codigo.trim().toUpperCase();

    const existing = await this.prisma.space.findUnique({
      where: { codigo: codigoClean },
    });
    if (existing) {
      throw new ConflictException(`El código de espacio ${codigoClean} ya existe.`);
    }

    const space = await this.prisma.space.create({
      data: {
        codigo: codigoClean,
        numero: createSpaceDto.numero,
        tipo: createSpaceDto.tipo || 'AUTOMOVIL',
        zona: createSpaceDto.zona.trim(),
        estado: createSpaceDto.estado || 'DISPONIBLE',
      },
    });

    if (adminId) {
      await this.prisma.auditLog.create({
        data: {
          userId: adminId,
          accion: 'CREAR_ESPACIO',
          entidad: 'Space',
          entidadId: space.id,
          detalles: `Espacio ${space.codigo} (${space.tipo}) creado en ${space.zona}`,
        },
      });
    }

    return space;
  }

  async updateState(id: string, estado: string, adminId?: string) {
    const space = await this.prisma.space.findUnique({ where: { id } });
    if (!space) {
      throw new NotFoundException(`Espacio no encontrado.`);
    }

    const updated = await this.prisma.space.update({
      where: { id },
      data: { estado },
    });

    if (adminId) {
      await this.prisma.auditLog.create({
        data: {
          userId: adminId,
          accion: 'CAMBIO_ESTADO_ESPACIO',
          entidad: 'Space',
          entidadId: id,
          detalles: `Estado del espacio ${updated.codigo} cambiado de ${space.estado} a ${estado}`,
        },
      });
    }

    return updated;
  }
}
