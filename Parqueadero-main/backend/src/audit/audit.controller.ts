import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles('ADMIN')
  async getLogs(@Query('search') search?: string, @Query('limit') limit?: string) {
    return this.auditService.getLogs(search, limit ? parseInt(limit, 10) : 100);
  }
}
