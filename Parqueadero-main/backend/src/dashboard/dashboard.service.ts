import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Espacios
    const totalEspacios = await this.prisma.space.count();
    const disponibles = await this.prisma.space.count({ where: { estado: 'DISPONIBLE' } });
    const ocupados = await this.prisma.space.count({ where: { estado: 'OCUPADO' } });
    const reservados = await this.prisma.space.count({ where: { estado: 'RESERVADO' } });
    const mantenimiento = await this.prisma.space.count({ where: { estado: 'MANTENIMIENTO' } });

    const porcentajeOcupacion = totalEspacios > 0 ? Math.round((ocupados / totalEspacios) * 100) : 0;

    // 2. Operación del día
    const vehiculosDentro = await this.prisma.movement.count({ where: { estado: 'DENTRO' } });
    const entradasHoy = await this.prisma.movement.count({
      where: { entryTime: { gte: todayStart, lte: todayEnd } },
    });
    const salidasHoy = await this.prisma.movement.count({
      where: { exitTime: { gte: todayStart, lte: todayEnd } },
    });
    const reservasHoy = await this.prisma.reservation.count({
      where: { fecha: { gte: todayStart, lte: todayEnd } },
    });

    // 3. Pagos e Ingresos
    const pagosExitososHoy = await this.prisma.payment.findMany({
      where: {
        estado: 'PAGADO',
        fechaPago: { gte: todayStart, lte: todayEnd },
      },
      select: { valorTotal: true },
    });
    const ingresosHoy = pagosExitososHoy.reduce((sum, p) => sum + p.valorTotal, 0);

    const pagosPendientesList = await this.prisma.payment.findMany({
      where: { estado: 'PENDIENTE' },
      select: { valorTotal: true },
    });
    const pagosPendientesCount = pagosPendientesList.length;
    const pagosPendientesMonto = pagosPendientesList.reduce((sum, p) => sum + p.valorTotal, 0);

    // 4. Datos para Gráficos
    // A. Distribución por tipo de usuario en movimientos de hoy
    const movimientosHoy = await this.prisma.movement.findMany({
      where: { entryTime: { gte: todayStart } },
      include: { user: true },
    });

    const userTypeMap: Record<string, number> = {
      ESTUDIANTE: 0,
      DOCENTE: 0,
      ADMINISTRATIVO: 0,
      VISITANTE: 0,
    };

    movimientosHoy.forEach((m) => {
      const type = m.user?.userType || 'VISITANTE';
      userTypeMap[type] = (userTypeMap[type] || 0) + 1;
    });

    const usoPorTipoUsuario = Object.entries(userTypeMap).map(([name, val]) => ({
      name,
      cantidad: val,
    }));

    // B. Flujo por horas del día de hoy (8am a 8pm)
    const hourlyFlow = [];
    for (let h = 7; h <= 20; h++) {
      const hourStart = new Date(todayStart);
      hourStart.setHours(h, 0, 0, 0);
      const hourEnd = new Date(todayStart);
      hourEnd.setHours(h, 59, 59, 999);

      const entradas = await this.prisma.movement.count({
        where: { entryTime: { gte: hourStart, lte: hourEnd } },
      });
      const salidas = await this.prisma.movement.count({
        where: { exitTime: { gte: hourStart, lte: hourEnd } },
      });

      hourlyFlow.push({
        hora: `${h}:00`,
        entradas,
        salidas,
      });
    }

    return {
      overview: {
        totalEspacios,
        disponibles,
        ocupados,
        reservados,
        mantenimiento,
        porcentajeOcupacion,
        vehiculosDentro,
        entradasHoy,
        salidasHoy,
        ingresosHoy,
        pagosPendientesCount,
        pagosPendientesMonto,
        reservasHoy,
      },
      charts: {
        usoPorTipoUsuario,
        flujoPorHoras: hourlyFlow,
      },
    };
  }
}
