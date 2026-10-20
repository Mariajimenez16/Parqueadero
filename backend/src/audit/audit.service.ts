import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async getLogs(
    search?: string,
    action?: string,
    dateFrom?: string,
    dateTo?: string,
    limit: number = 100,
  ) {
    const where: any = {};

    if (search) {
      where.OR = [
        { accion: { contains: search } },
        { entidad: { contains: search } },
        { detalles: { contains: search } },
        { user: { nombre: { contains: search } } },
        { user: { apellidos: { contains: search } } },
      ];
    }

    if (action && action !== 'TODAS') {
      where.accion = action;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        const dFrom = new Date(dateFrom);
        dFrom.setHours(0, 0, 0, 0);
        where.createdAt.gte = dFrom;
      }
      if (dateTo) {
        const dTo = new Date(dateTo);
        dTo.setHours(23, 59, 59, 999);
        where.createdAt.lte = dTo;
      }
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
