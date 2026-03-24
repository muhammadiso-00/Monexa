import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentIntent } from './entities/payment-intent.entity';
import { PaymentAttempt } from './entities/payment-attempt.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { LedgerModule } from '../ledger/ledger.module';
import { WalletsModule } from '../wallets/wallets.module';
import { LedgerJournal } from '../ledger/entities/ledger-journal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentIntent, PaymentAttempt, LedgerJournal]),
    LedgerModule,
    WalletsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [TypeOrmModule, PaymentsService],
})
export class PaymentsModule {}
