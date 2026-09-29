import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @Roles('ADMIN', 'VIGILANTE', 'CAJERO', 'USUARIO')
  async findAll(
    @GetUser() user: any,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    const filterUserId = user.role === 'USUARIO' ? user.id : undefined;
    return this.vehiclesService.findAll(search, type, status, filterUserId);
  }

  @Get('lookup/:identifier')
  @Roles('ADMIN', 'VIGILANTE', 'CAJERO')
  async findByIdentifier(@Param('identifier') identifier: string) {
    return this.vehiclesService.findByIdentifier(identifier);
  }

  @Get(':id')
  @Roles('ADMIN', 'VIGILANTE', 'CAJERO', 'USUARIO')
  async findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'USUARIO')
  async create(@Body() createVehicleDto: CreateVehicleDto, @GetUser() user: any) {
    if (user.role === 'USUARIO' || !createVehicleDto.userId) {
      createVehicleDto.userId = user.id;
    }
    return this.vehiclesService.create(createVehicleDto, user.id);
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @GetUser('id') userId: string,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto, userId);
  }

  @Patch(':id/authorization')
  @Roles('ADMIN')
  async toggleAuthorization(
    @Param('id') id: string,
    @Body('status') status: string,
    @GetUser('id') userId: string,
  ) {
    return this.vehiclesService.toggleAuthorization(id, status, userId);
  }
}
