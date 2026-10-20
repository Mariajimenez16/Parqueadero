import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async getPendingPayments(
    search?: string,
    dateFrom?: string,
    dateTo?: string,
    dayOfWeek?: number,
  ) {
    const where: any = { estado: 'PENDIENTE' };

    if (search) {
      where.OR = [
        { numeroFactura: { contains: search } },
        { movement: { vehicle: { placa: { contains: search.toUpperCase() } } } },
        { movement: { user: { nombre: { contains: search } } } },
        { movement: { user: { documento: { contains: search } } } },
      ];
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

    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        movement: {
          include: {
            vehicle: true,
            user: { select: { id: true, nombre: true, apellidos: true, documento: true, userType: true } },
            space: true,
          },
        },
        tariff: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (dayOfWeek !== undefined && !isNaN(dayOfWeek)) {
      return payments.filter((p) => {
        const date = new Date(p.createdAt);
        // dayOfWeek 1=Lunes (JS 1), ..., 7=Domingo (JS 0)
        const jsDay = date.getDay();
        const normalized = jsDay === 0 ? 7 : jsDay;
        return normalized === dayOfWeek;
      });
    }

    return payments;
  }

  async getPaymentHistory(
    search?: string,
    dateFrom?: string,
    dateTo?: string,
    dayOfWeek?: number,
    metodoPago?: string,
  ) {
    const where: any = { estado: 'PAGADO' };

    if (search) {
      where.OR = [
        { numeroFactura: { contains: search } },
        { movement: { vehicle: { placa: { contains: search.toUpperCase() } } } },
        { movement: { user: { nombre: { contains: search } } } },
        { movement: { user: { documento: { contains: search } } } },
      ];
    }

    if (metodoPago && metodoPago !== 'TODOS') {
      where.metodoPago = metodoPago;
    }

    if (dateFrom || dateTo) {
      where.fechaPago = {};
      if (dateFrom) {
        const dFrom = new Date(dateFrom);
        dFrom.setHours(0, 0, 0, 0);
        where.fechaPago.gte = dFrom;
      }
      if (dateTo) {
        const dTo = new Date(dateTo);
        dTo.setHours(23, 59, 59, 999);
        where.fechaPago.lte = dTo;
      }
    }

    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        movement: {
          include: {
            vehicle: true,
            user: { select: { id: true, nombre: true, apellidos: true, documento: true, userType: true } },
            space: true,
          },
        },
        cashier: { select: { id: true, nombre: true, apellidos: true } },
        tariff: true,
      },
      orderBy: { fechaPago: 'desc' },
      take: 200,
    });

    if (dayOfWeek !== undefined && !isNaN(dayOfWeek)) {
      return payments.filter((p) => {
        const targetDate = p.fechaPago ? new Date(p.fechaPago) : new Date(p.createdAt);
        const jsDay = targetDate.getDay();
        const normalized = jsDay === 0 ? 7 : jsDay;
        return normalized === dayOfWeek;
      });
    }

    return payments;
  }

  async processPayment(id: string, dto: ProcessPaymentDto, cashierId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        movement: {
          include: {
            vehicle: true,
            user: true,
            space: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`El registro de pago con ID ${id} no existe.`);
    }

    if (payment.estado === 'PAGADO') {
      throw new ConflictException('El pago ya fue registrado y procesado previamente.');
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        estado: 'PAGADO',
        metodoPago: dto.metodoPago,
        cashierId,
        fechaPago: new Date(),
      },
      include: {
        movement: {
          include: {
            vehicle: true,
            user: true,
            space: true,
          },
        },
        cashier: { select: { id: true, nombre: true, apellidos: true } },
        tariff: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: cashierId,
        accion: 'REGISTRO_PAGO',
        entidad: 'Payment',
        entidadId: id,
        detalles: `Pago de $${updatedPayment.valorTotal} procesado vía ${updatedPayment.metodoPago} para la factura ${updatedPayment.numeroFactura} (${updatedPayment.movement.vehicle.placa})`,
      },
    });

    return {
      message: 'Pago procesado exitosamente.',
      receipt: this.formatReceiptData(updatedPayment),
    };
  }

  async getReceiptData(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        movement: {
          include: {
            vehicle: true,
            user: true,
            space: true,
          },
        },
        cashier: { select: { id: true, nombre: true, apellidos: true } },
        tariff: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Comprobante no encontrado.`);
    }

    return this.formatReceiptData(payment);
  }

  private formatReceiptData(payment: any) {
    return {
      institucion: 'UNIVERSIDAD PRIVADA — PARQUEADERO CAMPUS CENTRAL',
      nit: '800.123.456-7',
      direccion: 'Av. Universitaria #45-100, Edificio Parqueaderos',
      telefono: '(601) 555-0199',
      numeroFactura: payment.numeroFactura,
      fechaEmision: payment.fechaPago || payment.createdAt,
      estadoPago: payment.estado,
      metodoPago: payment.metodoPago,
      usuario: {
        nombreCompleto: `${payment.movement.user.nombre} ${payment.movement.user.apellidos}`,
        documento: payment.movement.user.documento,
        tipoUsuario: payment.movement.user.userType,
        correo: payment.movement.user.correo,
      },
      vehiculo: {
        placa: payment.movement.vehicle.placa,
        tipo: payment.movement.vehicle.tipoVehiculo || payment.movement.vehicle.type,
        marca: payment.movement.vehicle.marca,
        modelo: payment.movement.vehicle.modelo,
        color: payment.movement.vehicle.color,
      },
      movimiento: {
        espacio: payment.movement.space.codigo,
        zona: payment.movement.space.zona,
        horaEntrada: payment.movement.entryTime,
        horaSalida: payment.movement.exitTime,
        duracionMinutos: payment.movement.duracionMinutos || 0,
        horasFacturables: Math.ceil((payment.movement.duracionMinutos || 1) / 60),
      },
      tarifa: {
        valorHora: payment.tariff?.valorHora || 3000,
        valorMinimo: payment.tariff?.valorMinimo || 2000,
      },
      valorTotal: payment.valorTotal,
      cajero: payment.cashier ? `${payment.cashier.nombre} ${payment.cashier.apellidos}` : 'Caja Principal / Sistema',
    };
  }
}
