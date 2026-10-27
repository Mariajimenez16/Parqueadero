import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildDateRange } from '../common/utils/date-range.util';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async getLogs(search?: string, limit: number = 100, dateFrom?: string, dateTo?: string) {
    const where: any = {};

    // Filtro por fecha del registro (el día final queda incluido completo)
    const range = buildDateRange(dateFrom, dateTo);
    if (range) {
      where.createdAt = range;
      // Con rango de fechas se amplía el límite para cubrir el período completo
      limit = Math.max(limit, 2000);
    }

    if (search) {
      where.OR = [
        { accion: { contains: search } },
        { entidad: { contains: search } },
        { detalles: { contains: search } },
        { user: { nombre: { contains: search } } },
        { user: { apellidos: { contains: search } } },
      ];
    }

    return this.prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, nombre: true, apellidos: true, role: true, correo: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
