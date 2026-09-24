import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  async findAll(@Query('status') status?: string, @Query('userId') userId?: string) {
    return this.reservationsService.findAll(status, userId);
  }

  @Post()
  @Roles('ADMIN', 'USUARIO')
  async create(@Body() dto: CreateReservationDto, @GetUser('id') creatorId: string) {
    return this.reservationsService.create(dto, creatorId);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @GetUser('id') operatorId: string) {
    return this.reservationsService.cancel(id, operatorId);
  }
}
