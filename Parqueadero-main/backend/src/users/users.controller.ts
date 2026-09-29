import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN', 'VIGILANTE', 'CAJERO')
  async findAll(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.findAll(search, role, status);
  }

  @Get(':id')
  @Roles('ADMIN', 'VIGILANTE', 'CAJERO')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() createUserDto: CreateUserDto, @GetUser('id') adminId: string) {
    return this.usersService.create(createUserDto, adminId);
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser('id') adminId: string,
  ) {
    return this.usersService.update(id, updateUserDto, adminId);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  async changeStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @GetUser('id') adminId: string,
  ) {
    return this.usersService.changeStatus(id, status, adminId);
  }
}
