import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { LedgerService } from '../ledger/ledger.service';
import { LedgerAccountType } from '../ledger/entities/ledger-account.entity';
import { EntryDirection } from '../ledger/entities/ledger-entry.entity';
import { TransactionType } from '../ledger/entities/ledger-journal.entity';

export const MNX_CURRENCY = 'MNX';

/** Convert fractional MNX display (e.g. 10.50) to integer cents (1050) */
export function toMnxCents(mnx: number): number {
  return Math.round(mnx * 100);
}

/** Convert cents (1050) to display string "10.50 MNX" */
export function formatMnx(cents: number): string {
  return `${(cents / 100).toFixed(2)} MNX`;
}

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    private readonly ledgerService: LedgerService,
  ) {}

  async getOrCreate(ownerId: string, ownerType: 'user' | 'merchant' | 'system'): Promise<Wallet> {
    let wallet = await this.walletRepo.findOne({
      where: { owner_id: ownerId, currency: MNX_CURRENCY },
    });

    if (!wallet) {
      wallet = this.walletRepo.create({
        owner_id: ownerId,
        owner_type: ownerType,
        currency: MNX_CURRENCY,
        available_balance: 0,
        held_balance: 0,
      });
      await this.walletRepo.save(wallet);

      // Also create the ledger account for this owner
      await this.ledgerService.findOrCreateAccount(ownerId, ownerType, LedgerAccountType.LIABILITY, MNX_CURRENCY);
    }

    return wallet;
  }

  async getBalance(ownerId: string): Promise<{ available: number; held: number; total: number }> {
    await this.getOrCreate(ownerId, 'user');
    const wallet = await this.walletRepo.findOne({
      where: { owner_id: ownerId, currency: MNX_CURRENCY },
    });
    const available = wallet?.available_balance ?? 0;
    const held = wallet?.held_balance ?? 0;
    return { available, held, total: available + held };
  }

  /**
   * Admin/demo deposit — creates platform → user ledger entries.
   * Platform uses an ASSET account (e.g. platform treasury).
   */
  async adminDeposit(userId: string, amountCents: number): Promise<void> {
    await this.getOrCreate(userId, 'user');
    const PLATFORM_ID = 'platform_treasury';

    // Ensure platform wallet + account exist
    let platformWallet = await this.walletRepo.findOne({
      where: { owner_id: PLATFORM_ID, currency: MNX_CURRENCY },
    });
    if (!platformWallet) {
      platformWallet = this.walletRepo.create({
        owner_id: PLATFORM_ID,
        owner_type: 'system',
        currency: MNX_CURRENCY,
        available_balance: 1_000_000_00, // 1 million MNX provisioned
        held_balance: 0,
      });
      await this.walletRepo.save(platformWallet);
    }

    const platformAccount = await this.ledgerService.findOrCreateAccount(
      PLATFORM_ID, 'system', LedgerAccountType.ASSET, MNX_CURRENCY,
    );
    const userAccount = await this.ledgerService.findOrCreateAccount(
      userId, 'user', LedgerAccountType.LIABILITY, MNX_CURRENCY,
    );

    await this.ledgerService.recordJournal(
      TransactionType.DEPOSIT,
      [
        { accountId: platformAccount.id, direction: EntryDirection.DEBIT, amount: amountCents },
        { accountId: userAccount.id, direction: EntryDirection.CREDIT, amount: amountCents },
      ],
      `Admin deposit of ${formatMnx(amountCents)} to user ${userId}`,
    );
  }
}
