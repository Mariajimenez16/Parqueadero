import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { RegisterEntryDto } from './dto/register-entry.dto';
import { RegisterExitDto } from './dto/register-exit.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Get('active')
  @Roles('ADMIN', 'VIGILANTE', 'CAJERO')
  async getActiveMovements(
    @Query('search') search?: string,
    @Query('tipoVehiculo') tipoVehiculo?: string,
  ) {
    return this.movementsService.getActiveMovements(search, tipoVehiculo);
  }

  @Get('history')
  @Roles('ADMIN', 'VIGILANTE', 'CAJERO')
  async getHistory(
    @Query('search') search?: string,
    @Query('estado') estado?: string,
    @Query('tipoVehiculo') tipoVehiculo?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('dayOfWeek') dayOfWeek?: string,
  ) {
    return this.movementsService.getHistory(
      search,
      estado,
      tipoVehiculo,
      dateFrom,
      dateTo,
      dayOfWeek ? parseInt(dayOfWeek, 10) : undefined,
    );
  }

  @Post('entry')
  @Roles('ADMIN', 'VIGILANTE', 'CAJERO')
  async registerEntry(
    @Body() dto: RegisterEntryDto,
    @GetUser('id') operatorId: string,
  ) {
    return this.movementsService.registerEntry(dto, operatorId);
  }

  @Post('exit')
  @Roles('ADMIN', 'VIGILANTE', 'CAJERO')
  async registerExit(
    @Body() dto: RegisterExitDto,
    @GetUser('id') operatorId: string,
  ) {
    return this.movementsService.registerExit(dto, operatorId);
  }
}
