export type Role = 'ADMIN' | 'VIGILANTE' | 'CAJERO' | 'USUARIO';
export type UserType = 'ESTUDIANTE' | 'DOCENTE' | 'ADMINISTRATIVO' | 'VISITANTE';
export type UserStatus = 'ACTIVO' | 'BLOQUEADO' | 'INACTIVO';

export type VehicleType = 'AUTOMOVIL' | 'MOTOCICLETA' | 'BICICLETA' | 'ELECTRICO';
export type VehicleStatus = 'AUTORIZADO' | 'NO_AUTORIZADO' | 'INACTIVO';

export type SpaceType = 'AUTOMOVIL' | 'MOTOCICLETA' | 'PREFERENCIAL';
export type SpaceStatus = 'DISPONIBLE' | 'OCUPADO' | 'RESERVADO' | 'MANTENIMIENTO' | 'INACTIVO';

export type ReservationStatus = 'PENDIENTE' | 'CONFIRMADA' | 'ACTIVA' | 'FINALIZADA' | 'CANCELADA';
export type MovementStatus = 'DENTRO' | 'FINALIZADO';
export type PaymentStatus = 'PENDIENTE' | 'PAGADO' | 'CANCELADO' | 'FALLIDO';
export type PaymentMethod = 'EFECTIVO' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'PAGO_DIGITAL';

export interface User {
  id: string;
  nombre: string;
  apellidos: string;
  documento: string;
  correo: string;
  telefono: string;
  userType: UserType;
  role: Role;
  status: UserStatus;
  createdAt?: string;
  vehicles?: Vehicle[];
}

export interface Vehicle {
  id: string;
  placa: string;
  type: VehicleType;
  marca: string;
  modelo: string;
  color: string;
  qrCodeToken: string;
  status: VehicleStatus;
  userId: string;
  user?: User;
  movements?: Movement[];
  createdAt?: string;
}

export interface Space {
  id: string;
  codigo: string;
  numero: number;
  tipo: SpaceType;
  zona: string;
  estado: SpaceStatus;
  movements?: Movement[];
  reservations?: Reservation[];
}

export interface Tariff {
  id: string;
  userType: UserType;
  vehicleType: VehicleType;
  valorHora: number;
  valorMinimo: number;
  valorMaximo?: number | null;
  estado: boolean;
}

export interface Reservation {
  id: string;
  userId: string;
  user?: User;
  vehicleId: string;
  vehicle?: Vehicle;
  spaceId: string;
  space?: Space;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: ReservationStatus;
  observaciones?: string;
}

export interface Movement {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  userId: string;
  user?: User;
  spaceId: string;
  space?: Space;
  operatorId: string;
  operator?: { id: string; nombre: string; apellidos: string };
  entryTime: string;
  exitTime?: string | null;
  duracionMinutos?: number | null;
  estado: MovementStatus;
  observaciones?: string;
  payment?: Payment;
}

export interface Payment {
  id: string;
  movementId: string;
  movement?: Movement;
  tariffId?: string;
  tariff?: Tariff;
  cashierId?: string;
  cashier?: { id: string; nombre: string; apellidos: string };
  valorTotal: number;
  metodoPago: PaymentMethod;
  estado: PaymentStatus;
  numeroFactura: string;
  fechaPago?: string;
  createdAt?: string;
}

export interface Receipt {
  institucion: string;
  nit: string;
  direccion: string;
  telefono: string;
  numeroFactura: string;
  fechaEmision: string;
  estadoPago: string;
  metodoPago: string;
  usuario: {
    nombreCompleto: string;
    documento: string;
    tipoUsuario: string;
    correo: string;
  };
  vehiculo: {
    placa: string;
    tipo: string;
    marca: string;
    modelo: string;
    color: string;
  };
  movimiento: {
    espacio: string;
    zona: string;
    horaEntrada: string;
    horaSalida?: string;
    duracionMinutos: number;
    horasFacturables: number;
  };
  tarifa: {
    valorHora: number;
    valorMinimo: number;
  };
  valorTotal: number;
  cajero: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  user?: User;
  accion: string;
  entidad: string;
  entidadId?: string;
  detalles?: string;
  createdAt: string;
}

export interface DashboardStats {
  overview: {
    totalEspacios: number;
    disponibles: number;
    ocupados: number;
    reservados: number;
    mantenimiento: number;
    porcentajeOcupacion: number;
    vehiculosDentro: number;
    entradasHoy: number;
    salidasHoy: number;
    ingresosHoy: number;
    pagosPendientesCount: number;
    pagosPendientesMonto: number;
    reservasHoy: number;
  };
  charts: {
    usoPorTipoUsuario: Array<{ name: string; cantidad: number }>;
    flujoPorHoras: Array<{ hora: string; entradas: number; salidas: number }>;
  };
}
