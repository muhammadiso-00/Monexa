import { Injectable, BadRequestException } from '@nestjs/common';
import { LedgerService } from '../ledger/ledger.service';
import { LedgerAccountType } from '../ledger/entities/ledger-account.entity';
import { EntryDirection } from '../ledger/entities/ledger-entry.entity';
import { TransactionType } from '../ledger/entities/ledger-journal.entity';
import { WalletService, MNX_CURRENCY, formatMnx } from '../wallets/wallet.service';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class TransfersService {
  constructor(
    private readonly ledgerService: LedgerService,
    private readonly walletService: WalletService,
  ) {}

  /**
   * P2P Transfer in MNX cents between two users.
   * Assumes both users exist.
   */
  async transferMnx(fromUser: User, toUser: User, amountCents: number): Promise<void> {
    if (amountCents <= 0) {
      throw new BadRequestException('Transfer amount must be greater than zero');
    }
    if (fromUser.id === toUser.id) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    // Ensure wallets exist (which also ensures ledger accounts exist)
    await this.walletService.getOrCreate(fromUser.id, 'user');
    await this.walletService.getOrCreate(toUser.id, 'user');

    const fromAccount = await this.ledgerService.findOrCreateAccount(
      fromUser.id, 'user', LedgerAccountType.LIABILITY, MNX_CURRENCY
    );
    const toAccount = await this.ledgerService.findOrCreateAccount(
      toUser.id, 'user', LedgerAccountType.LIABILITY, MNX_CURRENCY
    );

    await this.ledgerService.recordJournal(
      TransactionType.PAYMENT,
      [
        { accountId: fromAccount.id, direction: EntryDirection.DEBIT, amount: amountCents },
        { accountId: toAccount.id, direction: EntryDirection.CREDIT, amount: amountCents },
      ],
      `P2P Transfer of ${formatMnx(amountCents)} from user ${fromUser.id} to user ${toUser.id}`
    );
  }
}
