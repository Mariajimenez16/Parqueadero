import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildDateRange, parseStartDate, parseEndDate, toDayKey, DIAS_SEMANA } from '../common/utils/date-range.util';

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

    const customRange = buildDateRange(dateFrom, dateTo);

    if (customRange) {
      // Rango personalizado (el día final queda incluido completo)
      where.fechaPago = customRange;
    } else if (period === 'all') {
      // Sin filtro de fechas: todo el histórico
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
      rango: {
        desde: where.fechaPago?.gte || null,
        hasta: where.fechaPago?.lte || null,
      },
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

  async getPeakHoursReport(dateFrom?: string, dateTo?: string) {
    const range = buildDateRange(dateFrom, dateTo);
    const movements = await this.prisma.movement.findMany({
      where: range ? { entryTime: range } : {},
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

  async getSpaceUtilizationReport(dateFrom?: string, dateTo?: string) {
    const range = buildDateRange(dateFrom, dateTo);
    const spaces = await this.prisma.space.findMany({
      include: {
        movements: range ? { where: { entryTime: range } } : true,
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
  /**
   * Flujo diario del parqueadero (para análisis semanal / por período):
   * entradas, salidas, pagos e ingresos agrupados por día.
   * Si no se envía rango, se toman los últimos 7 días (incluyendo hoy).
   */
  async getDailyFlowReport(dateFrom?: string, dateTo?: string) {
    let start = parseStartDate(dateFrom);
    let end = parseEndDate(dateTo);

    if (!end) {
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }
    if (!start) {
      start = new Date(end);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    }

    const range = { gte: start, lte: end };

    const [entries, exits, payments] = await Promise.all([
      this.prisma.movement.findMany({ where: { entryTime: range }, select: { entryTime: true } }),
      this.prisma.movement.findMany({
        where: { exitTime: range },
        select: { exitTime: true, duracionMinutos: true },
      }),
      this.prisma.payment.findMany({
        where: { estado: 'PAGADO', fechaPago: range },
        select: { fechaPago: true, valorTotal: true },
      }),
    ]);

    // Crear un registro por cada día del rango (aunque no tenga movimientos)
    const days: Record<string, any> = {};
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    let guard = 0;
    while (cursor <= end && guard < 400) {
      const key = toDayKey(cursor);
      days[key] = {
        fecha: key,
        dia: DIAS_SEMANA[cursor.getDay()],
        entradas: 0,
        salidas: 0,
        pagos: 0,
        ingresos: 0,
        minutosTotales: 0,
      };
      cursor.setDate(cursor.getDate() + 1);
      guard++;
    }

    entries.forEach((m) => {
      const key = toDayKey(new Date(m.entryTime));
      if (days[key]) days[key].entradas++;
    });
    exits.forEach((m) => {
      const key = toDayKey(new Date(m.exitTime));
      if (days[key]) {
        days[key].salidas++;
        days[key].minutosTotales += m.duracionMinutos || 0;
      }
    });
    payments.forEach((p) => {
      const key = toDayKey(new Date(p.fechaPago));
      if (days[key]) {
        days[key].pagos++;
        days[key].ingresos += p.valorTotal;
      }
    });

    const detalle = Object.values(days).map((d: any) => ({
      fecha: d.fecha,
      dia: d.dia,
      entradas: d.entradas,
      salidas: d.salidas,
      pagos: d.pagos,
      ingresos: d.ingresos,
      estanciaPromedioMin: d.salidas > 0 ? Math.round(d.minutosTotales / d.salidas) : 0,
    }));

    const totalEntradas = detalle.reduce((acc, d) => acc + d.entradas, 0);
    const totalSalidas = detalle.reduce((acc, d) => acc + d.salidas, 0);
    const totalIngresos = detalle.reduce((acc, d) => acc + d.ingresos, 0);
    const diaMayorFlujo = detalle.reduce(
      (best, d) => (best === null || d.entradas > best.entradas ? d : best),
      null as any,
    );

    return {
      desde: start,
      hasta: end,
      totalEntradas,
      totalSalidas,
      totalPagos: detalle.reduce((acc, d) => acc + d.pagos, 0),
      totalIngresos,
      promedioEntradasDia: detalle.length > 0 ? Math.round((totalEntradas / detalle.length) * 10) / 10 : 0,
      diaMayorFlujo: diaMayorFlujo && diaMayorFlujo.entradas > 0 ? diaMayorFlujo : null,
      detalle,
    };
  }
}
