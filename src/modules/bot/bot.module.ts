import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { AuthModule } from '../auth/auth.module';
import { WalletsModule } from '../wallets/wallets.module';
import { PaymentsModule } from '../payments/payments.module';
import { TransfersModule } from '../transfers/transfers.module';

@Module({
  imports: [AuthModule, WalletsModule, PaymentsModule, TransfersModule],
  providers: [BotService],
})
export class BotModule {}
