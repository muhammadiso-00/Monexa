import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':id/balance')
  async getBalance(@Param('id') id: string) {
    return this.walletService.getBalance(id);
  }

  @Post('deposit')
  async deposit(@Body() body: { userId: string; amountCents: number }) {
    await this.walletService.adminDeposit(body.userId, body.amountCents);
    return { success: true };
  }
}
