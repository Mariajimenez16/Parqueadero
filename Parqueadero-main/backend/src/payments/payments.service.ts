import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async getPendingPayments(search?: string) {
    const where: any = { estado: 'PENDIENTE' };

    if (search) {
      where.OR = [
        { numeroFactura: { contains: search } },
        { movement: { vehicle: { placa: { contains: search.toUpperCase() } } } },
        { movement: { user: { nombre: { contains: search } } } },
        { movement: { user: { documento: { contains: search } } } },
      ];
    }

    return this.prisma.payment.findMany({
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
  }

  async getPaymentHistory(search?: string, dateFrom?: string, dateTo?: string) {
    const where: any = { estado: 'PAGADO' };

    if (search) {
      where.OR = [
        { numeroFactura: { contains: search } },
        { movement: { vehicle: { placa: { contains: search.toUpperCase() } } } },
        { movement: { user: { nombre: { contains: search } } } },
      ];
    }

    if (dateFrom || dateTo) {
      where.fechaPago = {};
      if (dateFrom) where.fechaPago.gte = new Date(dateFrom);
      if (dateTo) where.fechaPago.lte = new Date(dateTo);
    }

    return this.prisma.payment.findMany({
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
        tipo: payment.movement.vehicle.type,
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
