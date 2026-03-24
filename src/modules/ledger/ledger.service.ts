import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LedgerAccount, LedgerAccountType } from './entities/ledger-account.entity';
import { LedgerJournal, TransactionType } from './entities/ledger-journal.entity';
import { LedgerEntry, EntryDirection } from './entities/ledger-entry.entity';
import { Wallet } from '../wallets/entities/wallet.entity';

export interface LedgerEntryInput {
  accountId: string;
  direction: EntryDirection;
  amount: number;
}

@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(LedgerAccount)
    private readonly accountRepo: Repository<LedgerAccount>,
  ) {}

  /**
   * Core double-entry method. Opens a DB transaction, acquires a row lock on
   * every affected wallet, validates the accounting equation (debits == credits),
   * then atomically inserts journal + entries and updates wallet balances.
   */
  async recordJournal(
    type: TransactionType,
    entries: LedgerEntryInput[],
    description?: string,
  ): Promise<LedgerJournal> {
    // Accounting invariant: sum of credits must equal sum of debits
    const totalCredits = entries
      .filter((e) => e.direction === EntryDirection.CREDIT)
      .reduce((s, e) => s + e.amount, 0);
    const totalDebits = entries
      .filter((e) => e.direction === EntryDirection.DEBIT)
      .reduce((s, e) => s + e.amount, 0);

    if (totalCredits !== totalDebits) {
      throw new BadRequestException(
        `Ledger imbalanced: credits=${totalCredits} debits=${totalDebits}`,
      );
    }

    return this.dataSource.transaction(async (em) => {
      // Collect unique account IDs and lock their wallets
      const accountIds = [...new Set(entries.map((e) => e.accountId))];
      const accounts = await em.find(LedgerAccount, {
        where: accountIds.map((id) => ({ id })),
      });

      // Lock wallets for each account owner (prevents overdraft race condition)
      for (const account of accounts) {
        if (account.owner_id) {
          await em
            .getRepository(Wallet)
            .createQueryBuilder('wallet')
            .setLock('pessimistic_write')
            .where('wallet.owner_id = :ownerId AND wallet.currency = :currency', {
              ownerId: account.owner_id,
              currency: account.currency,
            })
            .getOne();
        }
      }

      // Validate sufficient balance for debited accounts (non-asset accounts = user wallets)
      for (const entry of entries.filter((e) => e.direction === EntryDirection.DEBIT)) {
        const account = accounts.find((a) => a.id === entry.accountId);
        if (!account) throw new BadRequestException(`Account ${entry.accountId} not found`);

        if (account.type === LedgerAccountType.LIABILITY) {
          const wallet = await em
            .getRepository(Wallet)
            .findOne({ where: { owner_id: account.owner_id, currency: account.currency } });

          if (!wallet || wallet.available_balance < entry.amount) {
            throw new BadRequestException(
              `Insufficient balance. Available: ${wallet?.available_balance ?? 0} mnx-cents, Needed: ${entry.amount}`,
            );
          }
        }
      }

      // Insert the journal record
      const journal = em.create(LedgerJournal, { transaction_type: type, description });
      await em.save(journal);

      // Insert each ledger entry
      const entryRecords: LedgerEntry[] = [];
      for (const e of entries) {
        const account = accounts.find((a) => a.id === e.accountId);
        const record = em.create(LedgerEntry, {
          journal,
          account,
          amount: e.amount,
          direction: e.direction,
        });
        entryRecords.push(record);
      }
      await em.save(entryRecords);

      // Update wallet balances atomically
      for (const entry of entries) {
        const account = accounts.find((a) => a.id === entry.accountId);
        if (!account?.owner_id) continue;

        const delta = entry.direction === EntryDirection.CREDIT ? entry.amount : -entry.amount;
        await em
          .getRepository(Wallet)
          .createQueryBuilder()
          .update()
          .set({ available_balance: () => `available_balance + ${delta}` })
          .where('owner_id = :ownerId AND currency = :currency', {
            ownerId: account.owner_id,
            currency: account.currency,
          })
          .execute();
      }

      this.logger.log(`Journal recorded: type=${type} totalAmount=${totalCredits}`);
      return journal;
    });
  }

  async findOrCreateAccount(
    ownerId: string,
    ownerType: string,
    type: LedgerAccountType,
    currency = 'MNX',
  ): Promise<LedgerAccount> {
    let account = await this.accountRepo.findOne({ where: { owner_id: ownerId, currency } });
    if (!account) {
      account = this.accountRepo.create({
        name: `${ownerType}:${ownerId}`,
        type,
        owner_id: ownerId,
        currency,
      });
      await this.accountRepo.save(account);
    }
    return account;
  }
}
