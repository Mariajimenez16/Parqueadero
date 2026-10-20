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

  async getWeeklyFlow(startDateStr?: string, endDateStr?: string) {
    let start: Date;
    let end: Date;

    if (startDateStr && endDateStr) {
      start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);

      end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999);
    } else {
      const now = new Date();
      // Calcular el lunes de la semana actual (0 es domingo, 1 es lunes)
      const day = now.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      start = new Date(now);
      start.setDate(now.getDate() + diffToMonday);
      start.setHours(0, 0, 0, 0);

      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    }

    // Consultar todos los movimientos en el período
    const movements = await this.prisma.movement.findMany({
      where: {
        OR: [
          { entryTime: { gte: start, lte: end } },
          { exitTime: { gte: start, lte: end } },
        ],
      },
      include: {
        vehicle: true,
        user: true,
      },
    });

    // Consultar todos los pagos en el período
    const payments = await this.prisma.payment.findMany({
      where: {
        estado: 'PAGADO',
        fechaPago: { gte: start, lte: end },
      },
      select: {
        id: true,
        valorTotal: true,
        metodoPago: true,
        fechaPago: true,
      },
    });

    // Agrupar por días de la semana (Lunes a Domingo)
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    // Generar la lista de días entre start y end
    const dailyStats = [];
    const curr = new Date(start);
    while (curr <= end) {
      const dayStart = new Date(curr);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(curr);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOfWeekIndex = (curr.getDay() + 6) % 7; // 0=Lunes, 6=Domingo
      const dayName = dayNames[dayOfWeekIndex];
      const dateStr = curr.toISOString().split('T')[0];

      // Entradas en este día
      const entradas = movements.filter(
        (m) => m.entryTime && m.entryTime >= dayStart && m.entryTime <= dayEnd,
      ).length;

      // Salidas en este día
      const salidas = movements.filter(
        (m) => m.exitTime && m.exitTime >= dayStart && m.exitTime <= dayEnd,
      ).length;

      // Recaudo en este día
      const pagosDelDia = payments.filter(
        (p) => p.fechaPago && p.fechaPago >= dayStart && p.fechaPago <= dayEnd,
      );
      const recaudo = pagosDelDia.reduce((sum, p) => sum + p.valorTotal, 0);
      const cantidadPagos = pagosDelDia.length;

      dailyStats.push({
        fecha: dateStr,
        dia: dayName,
        diaSemana: dayOfWeekIndex + 1, // 1=Lunes, 7=Domingo
        entradas,
        salidas,
        totalOperaciones: entradas + salidas,
        recaudo,
        cantidadPagos,
      });

      curr.setDate(curr.getDate() + 1);
    }

    // Totales generales del período
    const totalEntradas = dailyStats.reduce((sum, d) => sum + d.entradas, 0);
    const totalSalidas = dailyStats.reduce((sum, d) => sum + d.salidas, 0);
    const totalRecaudo = dailyStats.reduce((sum, d) => sum + d.recaudo, 0);
    const totalOperaciones = totalEntradas + totalSalidas;

    // Día con mayor y menor flujo
    let diaMayorFlujo = null;
    let diaMenorFlujo = null;
    if (dailyStats.length > 0) {
      const sortedByFlow = [...dailyStats].sort((a, b) => b.totalOperaciones - a.totalOperaciones);
      diaMayorFlujo = sortedByFlow[0];
      diaMenorFlujo = sortedByFlow[sortedByFlow.length - 1];
    }

    const promedioDiarioOperaciones = dailyStats.length > 0
      ? Math.round((totalOperaciones / dailyStats.length) * 10) / 10
      : 0;

    // Distribución por tipo de vehículo en el período
    const vehicleTypeMap: Record<string, number> = {
      AUTOMOVIL: 0,
      MOTOCICLETA: 0,
      BICICLETA: 0,
    };
    movements.forEach((m) => {
      const type = m.vehicle?.tipoVehiculo || 'AUTOMOVIL';
      vehicleTypeMap[type] = (vehicleTypeMap[type] || 0) + 1;
    });

    // Distribución por tipo de usuario en el período
    const userTypeMap: Record<string, number> = {
      ESTUDIANTE: 0,
      DOCENTE: 0,
      ADMINISTRATIVO: 0,
      VISITANTE: 0,
    };
    movements.forEach((m) => {
      const type = m.user?.userType || 'VISITANTE';
      userTypeMap[type] = (userTypeMap[type] || 0) + 1;
    });

    return {
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        diasAnalizados: dailyStats.length,
      },
      kpis: {
        totalEntradas,
        totalSalidas,
        totalOperaciones,
        totalRecaudo,
        promedioDiarioOperaciones,
        diaMayorFlujo: diaMayorFlujo ? { dia: diaMayorFlujo.dia, fecha: diaMayorFlujo.fecha, operaciones: diaMayorFlujo.totalOperaciones } : null,
        diaMenorFlujo: diaMenorFlujo ? { dia: diaMenorFlujo.dia, fecha: diaMenorFlujo.fecha, operaciones: diaMenorFlujo.totalOperaciones } : null,
      },
      dailyStats,
      distribucionVehiculos: Object.entries(vehicleTypeMap).map(([name, cantidad]) => ({ name, cantidad })),
      distribucionUsuarios: Object.entries(userTypeMap).map(([name, cantidad]) => ({ name, cantidad })),
    };
  }
}
