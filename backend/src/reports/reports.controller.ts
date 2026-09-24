import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('occupancy')
  @Roles('ADMIN')
  async getOccupancy(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getOccupancyReport(startDate, endDate);
  }

  @Get('revenue')
  @Roles('ADMIN')
  async getRevenue(
    @Query('period') period?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportsService.getRevenueReport(period, dateFrom, dateTo);
  }

  @Get('peak-hours')
  @Roles('ADMIN')
  async getPeakHours() {
    return this.reportsService.getPeakHoursReport();
  }

  @Get('spaces-utilization')
  @Roles('ADMIN')
  async getSpaceUtilization() {
    return this.reportsService.getSpaceUtilizationReport();
  }
}
