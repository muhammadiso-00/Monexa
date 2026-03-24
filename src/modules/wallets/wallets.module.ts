import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Hold } from './entities/hold.entity';
import { WalletService } from './wallet.service';
import { WalletsController } from './wallets.controller';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Hold]), LedgerModule],
  controllers: [WalletsController],
  providers: [WalletService],
  exports: [TypeOrmModule, WalletService],
})
export class WalletsModule {}
