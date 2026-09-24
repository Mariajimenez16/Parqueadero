import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Get()
  async findAll(
    @Query('zona') zona?: string,
    @Query('estado') estado?: string,
    @Query('tipo') tipo?: string,
  ) {
    return this.spacesService.findAll(zona, estado, tipo);
  }

  @Get('summary')
  async getSummary() {
    return this.spacesService.getMapSummary();
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() createSpaceDto: CreateSpaceDto, @GetUser('id') adminId: string) {
    return this.spacesService.create(createSpaceDto, adminId);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  async updateState(
    @Param('id') id: string,
    @Body('estado') estado: string,
    @GetUser('id') adminId: string,
  ) {
    return this.spacesService.updateState(id, estado, adminId);
  }
}
