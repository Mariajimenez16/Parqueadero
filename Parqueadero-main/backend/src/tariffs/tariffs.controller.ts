import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { TariffsService } from './tariffs.service';
import { CreateTariffDto } from './dto/create-tariff.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('tariffs')
export class TariffsController {
  constructor(private readonly tariffsService: TariffsService) {}

  @Get()
  async findAll() {
    return this.tariffsService.findAll();
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() createTariffDto: CreateTariffDto, @GetUser('id') adminId: string) {
    return this.tariffsService.create(createTariffDto, adminId);
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateTariffDto>,
    @GetUser('id') adminId: string,
  ) {
    return this.tariffsService.update(id, updateDto, adminId);
  }
}
