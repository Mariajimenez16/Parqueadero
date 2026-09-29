import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async getLogs(search?: string, limit: number = 100) {
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
