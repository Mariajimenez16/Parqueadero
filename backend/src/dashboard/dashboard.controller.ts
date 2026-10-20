import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles('ADMIN', 'VIGILANTE', 'CAJERO')
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('weekly-flow')
  @Roles('ADMIN', 'VIGILANTE', 'CAJERO')
  async getWeeklyFlow(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getWeeklyFlow(startDate, endDate);
  }
}
