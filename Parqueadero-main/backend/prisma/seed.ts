import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed de datos para Parqueadero Universitario...');

  // Limpiar base de datos
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.movement.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.tariff.deleteMany();
  await prisma.space.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const vigilantePassword = await bcrypt.hash('Vigilante123!', 10);
  const cajeroPassword = await bcrypt.hash('Cajero123!', 10);
  const userPassword = await bcrypt.hash('User123!', 10);

  // 1. Crear Usuarios de Prueba
  const adminUser = await prisma.user.create({
    data: {
      nombre: 'Carlos',
      apellidos: 'Administrador Principal',
      documento: '1090123456',
      correo: 'admin@parqueadero.com',
      telefono: '3001234567',
      passwordHash: passwordHash,
      userType: 'ADMINISTRATIVO',
      role: 'ADMIN',
      status: 'ACTIVO',
    },
  });

  const vigilanteUser = await prisma.user.create({
    data: {
      nombre: 'Pedro',
      apellidos: 'Gómez (Vigilancia)',
      documento: '1090654321',
      correo: 'vigilante@parqueadero.com',
      telefono: '3009876543',
      passwordHash: vigilantePassword,
      userType: 'ADMINISTRATIVO',
      role: 'VIGILANTE',
      status: 'ACTIVO',
    },
  });

  const cajeroUser = await prisma.user.create({
    data: {
      nombre: 'María',
      apellidos: 'Rodríguez (Caja)',
      documento: '1090888999',
      correo: 'cajero@parqueadero.com',
      telefono: '3005554433',
      passwordHash: cajeroPassword,
      userType: 'ADMINISTRATIVO',
      role: 'CAJERO',
      status: 'ACTIVO',
    },
  });

  const estudianteUser = await prisma.user.create({
    data: {
      nombre: 'Juan Pablo',
      apellidos: 'Martínez (Estudiante)',
      documento: '1090111222',
      correo: 'estudiante@parqueadero.com',
      telefono: '3112223344',
      passwordHash: userPassword,
      userType: 'ESTUDIANTE',
      role: 'USUARIO',
      status: 'ACTIVO',
    },
  });

  const docenteUser = await prisma.user.create({
    data: {
      nombre: 'Dra. Elena',
      apellidos: 'Vargas (Docente)',
      documento: '1090333444',
      correo: 'docente@parqueadero.com',
      telefono: '3123334455',
      passwordHash: userPassword,
      userType: 'DOCENTE',
      role: 'USUARIO',
      status: 'ACTIVO',
    },
  });

  const usuarioBloqueado = await prisma.user.create({
    data: {
      nombre: 'Roberto',
      apellidos: 'Sánchez (Moroso)',
      documento: '1090777888',
      correo: 'bloqueado@parqueadero.com',
      telefono: '3156667788',
      passwordHash: userPassword,
      userType: 'ESTUDIANTE',
      role: 'USUARIO',
      status: 'BLOQUEADO',
    },
  });

  console.log('✅ Usuarios creados correctamente.');

  // 2. Crear Tarifas
  const tarifas = [
    { userType: 'ESTUDIANTE', vehicleType: 'AUTOMOVIL', valorHora: 2500, valorMinimo: 2000, valorMaximo: 15000 },
    { userType: 'ESTUDIANTE', vehicleType: 'MOTOCICLETA', valorHora: 1200, valorMinimo: 1000, valorMaximo: 7000 },
    { userType: 'DOCENTE', vehicleType: 'AUTOMOVIL', valorHora: 3000, valorMinimo: 2500, valorMaximo: 18000 },
    { userType: 'DOCENTE', vehicleType: 'MOTOCICLETA', valorHora: 1500, valorMinimo: 1200, valorMaximo: 9000 },
    { userType: 'ADMINISTRATIVO', vehicleType: 'AUTOMOVIL', valorHora: 3500, valorMinimo: 3000, valorMaximo: 20000 },
    { userType: 'ADMINISTRATIVO', vehicleType: 'MOTOCICLETA', valorHora: 1800, valorMinimo: 1500, valorMaximo: 10000 },
    { userType: 'VISITANTE', vehicleType: 'AUTOMOVIL', valorHora: 5000, valorMinimo: 4000, valorMaximo: 30000 },
    { userType: 'VISITANTE', vehicleType: 'MOTOCICLETA', valorHora: 2500, valorMinimo: 2000, valorMaximo: 15000 },
  ];

  for (const t of tarifas) {
    await prisma.tariff.create({ data: t });
  }

  console.log('✅ Tarifas inicializadas.');

  // 3. Crear Espacios (15 autos, 5 motos)
  const espaciosData = [];
  // Zona A - Autos (15 espacios)
  for (let i = 1; i <= 15; i++) {
    const numStr = i < 10 ? `0${i}` : `${i}`;
    espaciosData.push({
      codigo: `A-${numStr}`,
      numero: i,
      tipo: i <= 2 ? 'PREFERENCIAL' : 'AUTOMOVIL',
      zona: 'Zona A - Edificio Central',
      estado: 'DISPONIBLE',
    });
  }
  // Zona M - Motos (5 espacios)
  for (let i = 1; i <= 5; i++) {
    espaciosData.push({
      codigo: `M-0${i}`,
      numero: i,
      tipo: 'MOTOCICLETA',
      zona: 'Zona M - Bahía de Motos',
      estado: 'DISPONIBLE',
    });
  }

  for (const esp of espaciosData) {
    await prisma.space.create({ data: esp });
  }

  console.log('✅ 20 Espacios de parqueadero creados.');

  // 4. Crear Vehículos
  const vehiculo1 = await prisma.vehicle.create({
    data: {
      placa: 'KLR-456',
      type: 'AUTOMOVIL',
      marca: 'Mazda',
      modelo: '3 Sedan',
      color: 'Rojo Cristal',
      qrCodeToken: 'QR-KLR456-ESTUDIANTE',
      status: 'AUTORIZADO',
      userId: estudianteUser.id,
    },
  });

  const vehiculo2 = await prisma.vehicle.create({
    data: {
      placa: 'MXZ-890',
      type: 'AUTOMOVIL',
      marca: 'Toyota',
      modelo: 'Corolla Hybrid',
      color: 'Gris Metalizado',
      qrCodeToken: 'QR-MXZ890-DOCENTE',
      status: 'AUTORIZADO',
      userId: docenteUser.id,
    },
  });

  const vehiculo3 = await prisma.vehicle.create({
    data: {
      placa: 'MTO-12D',
      type: 'MOTOCICLETA',
      marca: 'Yamaha',
      modelo: 'MT-03',
      color: 'Negro Mate',
      qrCodeToken: 'QR-MTO12D-ESTUDIANTE',
      status: 'AUTORIZADO',
      userId: estudianteUser.id,
    },
  });

  const vehiculoNoAutorizado = await prisma.vehicle.create({
    data: {
      placa: 'XYZ-999',
      type: 'AUTOMOVIL',
      marca: 'Chevrolet',
      modelo: 'Spark',
      color: 'Blanco',
      qrCodeToken: 'QR-XYZ999-BLOQUEADO',
      status: 'NO_AUTORIZADO',
      userId: usuarioBloqueado.id,
    },
  });

  console.log('✅ Vehículos de prueba creados.');

  // 5. Asignar estado a algunos espacios y crear Movimientos Activos
  const espacioA1 = await prisma.space.findUnique({ where: { codigo: 'A-01' } });
  const espacioA2 = await prisma.space.findUnique({ where: { codigo: 'A-02' } });

  if (espacioA1 && espacioA2) {
    // Espacio A-01 pasa a OCUPADO por vehiculo1 (KLR-456)
    await prisma.space.update({
      where: { id: espacioA1.id },
      data: { estado: 'OCUPADO' },
    });

    const entryTime1 = new Date();
    entryTime1.setHours(entryTime1.getHours() - 2); // Ingresó hace 2 horas

    await prisma.movement.create({
      data: {
        vehicleId: vehiculo1.id,
        userId: estudianteUser.id,
        spaceId: espacioA1.id,
        operatorId: vigilanteUser.id,
        entryTime: entryTime1,
        estado: 'DENTRO',
        observaciones: 'Ingreso regular por torniquete Norte con QR',
      },
    });

    // Movimiento Finalizado anterior con Deuda Pendiente de Pago
    const entryTimeHistorical = new Date();
    entryTimeHistorical.setHours(entryTimeHistorical.getHours() - 5);
    const exitTimeHistorical = new Date();
    exitTimeHistorical.setHours(exitTimeHistorical.getHours() - 3);

    const movHistorico = await prisma.movement.create({
      data: {
        vehicleId: vehiculo2.id,
        userId: docenteUser.id,
        spaceId: espacioA2.id,
        operatorId: vigilanteUser.id,
        entryTime: entryTimeHistorical,
        exitTime: exitTimeHistorical,
        duracionMinutos: 120,
        estado: 'FINALIZADO',
        observaciones: 'Salida registrada. Pendiente de pago en caja.',
      },
    });

    // Crear Pago Pendiente para este movimiento
    const tariffDocente = await prisma.tariff.findFirst({
      where: { userType: 'DOCENTE', vehicleType: 'AUTOMOVIL' },
    });

    await prisma.payment.create({
      data: {
        movementId: movHistorico.id,
        tariffId: tariffDocente?.id,
        valorTotal: 6000.0,
        metodoPago: 'EFECTIVO',
        estado: 'PENDIENTE',
        numeroFactura: 'FAC-2026-00001',
      },
    });
  }

  // 6. Crear Reservas de Demostración
  const espacioA5 = await prisma.space.findUnique({ where: { codigo: 'A-05' } });
  if (espacioA5) {
    const fechaReserva = new Date();
    fechaReserva.setDate(fechaReserva.getDate() + 1);

    const horaInicio = new Date(fechaReserva);
    horaInicio.setHours(8, 0, 0, 0);
    const horaFin = new Date(fechaReserva);
    horaFin.setHours(12, 0, 0, 0);

    await prisma.reservation.create({
      data: {
        userId: docenteUser.id,
        vehicleId: vehiculo2.id,
        spaceId: espacioA5.id,
        fecha: fechaReserva,
        horaInicio: horaInicio,
        horaFin: horaFin,
        estado: 'CONFIRMADA',
        observaciones: 'Reserva para sesión académica docente',
      },
    });

    await prisma.space.update({
      where: { id: espacioA5.id },
      data: { estado: 'RESERVADO' },
    });
  }

  // 7. Auditoría inicial
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      accion: 'SEED_SISTEMA',
      entidad: 'Sistema',
      detalles: 'Base de datos inicializada con datos de prueba realistas para sustentación.',
    },
  });

  console.log('🚀 Seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
