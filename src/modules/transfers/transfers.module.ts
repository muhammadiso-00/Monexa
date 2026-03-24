import { Module } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { LedgerModule } from '../ledger/ledger.module';
import { WalletsModule } from '../wallets/wallets.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [LedgerModule, WalletsModule, AuthModule],
  providers: [TransfersService],
  exports: [TransfersService],
})
export class TransfersModule {}
