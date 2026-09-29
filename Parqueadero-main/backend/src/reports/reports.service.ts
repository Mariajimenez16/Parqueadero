import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getOccupancyReport(startDate?: string, endDate?: string) {
    const totalSpaces = await this.prisma.space.count();
    const ocupados = await this.prisma.space.count({ where: { estado: 'OCUPADO' } });
    const disponibles = await this.prisma.space.count({ where: { estado: 'DISPONIBLE' } });
    const reservados = await this.prisma.space.count({ where: { estado: 'RESERVADO' } });
    const mantenimiento = await this.prisma.space.count({ where: { estado: 'MANTENIMIENTO' } });

    return {
      capacidadTotal: totalSpaces,
      espaciosOcupados: ocupados,
      espaciosDisponibles: disponibles,
      espaciosReservados: reservados,
      espaciosMantenimiento: mantenimiento,
      porcentajeOcupacion: totalSpaces > 0 ? Math.round((ocupados / totalSpaces) * 100) : 0,
      fechaGeneracion: new Date(),
    };
  }

  async getRevenueReport(period: string = 'month', dateFrom?: string, dateTo?: string) {
    const where: any = { estado: 'PAGADO' };

    const now = new Date();
    let startDate = new Date();

    if (dateFrom && dateTo) {
      where.fechaPago = { gte: new Date(dateFrom), lte: new Date(dateTo) };
    } else {
      if (period === 'day') {
        startDate.setHours(0, 0, 0, 0);
      } else if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else {
        startDate.setMonth(now.getMonth() - 1);
      }
      where.fechaPago = { gte: startDate };
    }

    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        movement: { include: { user: true, vehicle: true } },
      },
    });

    const totalIngresos = payments.reduce((sum, p) => sum + p.valorTotal, 0);
    const cantidadPagos = payments.length;
    const promedioPago = cantidadPagos > 0 ? Math.round(totalIngresos / cantidadPagos) : 0;

    // Distribución por tipo de usuario
    const userTypeRevenue: Record<string, number> = {};
    // Distribución por método de pago
    const methodRevenue: Record<string, number> = {};

    payments.forEach((p) => {
      const uType = p.movement?.user?.userType || 'VISITANTE';
      const method = p.metodoPago || 'EFECTIVO';

      userTypeRevenue[uType] = (userTypeRevenue[uType] || 0) + p.valorTotal;
      methodRevenue[method] = (methodRevenue[method] || 0) + p.valorTotal;
    });

    return {
      periodo: period,
      totalIngresos,
      cantidadPagos,
      promedioPago,
      distribucionPorTipoUsuario: Object.entries(userTypeRevenue).map(([tipo, total]) => ({ tipo, total })),
      distribucionPorMetodoPago: Object.entries(methodRevenue).map(([metodo, total]) => ({ metodo, total })),
      detalle: payments.map((p) => ({
        factura: p.numeroFactura,
        fecha: p.fechaPago,
        placa: p.movement?.vehicle?.placa,
        usuario: `${p.movement?.user?.nombre} ${p.movement?.user?.apellidos}`,
        tipoUsuario: p.movement?.user?.userType,
        metodo: p.metodoPago,
        monto: p.valorTotal,
      })),
    };
  }

  async getPeakHoursReport() {
    const movements = await this.prisma.movement.findMany({
      select: { entryTime: true },
    });

    const hourCounts: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourCounts[h] = 0;

    movements.forEach((m) => {
      const hour = new Date(m.entryTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts).map(([h, count]) => ({
      hora: `${h}:00`,
      ingresos: count,
    }));
  }

  async getSpaceUtilizationReport() {
    const spaces = await this.prisma.space.findMany({
      include: {
        movements: true,
      },
    });

    return spaces.map((s) => ({
      codigo: s.codigo,
      tipo: s.tipo,
      zona: s.zona,
      estadoActual: s.estado,
      totalUsos: s.movements.length,
      tiempoTotalMinutos: s.movements.reduce((acc, m) => acc + (m.duracionMinutos || 0), 0),
    })).sort((a, b) => b.totalUsos - a.totalUsos);
  }
}
