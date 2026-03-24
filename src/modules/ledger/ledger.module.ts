import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LedgerAccount } from './entities/ledger-account.entity';
import { LedgerJournal } from './entities/ledger-journal.entity';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { LedgerService } from './ledger.service';

@Module({
  imports: [TypeOrmModule.forFeature([LedgerAccount, LedgerJournal, LedgerEntry])],
  providers: [LedgerService],
  exports: [TypeOrmModule, LedgerService],
})
export class LedgerModule {}
