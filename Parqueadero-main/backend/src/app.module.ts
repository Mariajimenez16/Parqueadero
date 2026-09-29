import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { SpacesModule } from './spaces/spaces.module';
import { TariffsModule } from './tariffs/tariffs.module';
import { MovementsModule } from './movements/movements.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PaymentsModule } from './payments/payments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VehiclesModule,
    SpacesModule,
    TariffsModule,
    MovementsModule,
    ReservationsModule,
    PaymentsModule,
    DashboardModule,
    ReportsModule,
    AuditModule,
  ],
})
export class AppModule {}
