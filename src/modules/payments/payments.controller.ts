import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async createPayment(@Body() body: { from: string; to: string; amount: number; idempotencyKey: string }) {
    return this.paymentsService.createPay(body.from, body.to, body.amount, body.idempotencyKey);
  }

  @Get(':id/history')
  async getHistory(@Param('id') userId: string, @Query('limit') limitStr?: string) {
    const limit = limitStr ? parseInt(limitStr, 10) : 10;
    return this.paymentsService.getHistory(userId, limit);
  }
}
