import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('pending')
  @Roles('ADMIN', 'CAJERO', 'VIGILANTE')
  async getPendingPayments(@Query('search') search?: string) {
    return this.paymentsService.getPendingPayments(search);
  }

  @Get('history')
  @Roles('ADMIN', 'CAJERO')
  async getPaymentHistory(
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.paymentsService.getPaymentHistory(search, dateFrom, dateTo);
  }

  @Post(':id/pay')
  @Roles('ADMIN', 'CAJERO')
  async processPayment(
    @Param('id') id: string,
    @Body() dto: ProcessPaymentDto,
    @GetUser('id') cashierId: string,
  ) {
    return this.paymentsService.processPayment(id, dto, cashierId);
  }

  @Get(':id/receipt')
  async getReceiptData(@Param('id') id: string) {
    return this.paymentsService.getReceiptData(id);
  }
}
