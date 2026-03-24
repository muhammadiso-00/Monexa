import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentIntent, PaymentStatus } from './entities/payment-intent.entity';
import { PaymentAttempt, AttemptStatus } from './entities/payment-attempt.entity';
import { LedgerService } from '../ledger/ledger.service';
import { LedgerAccountType } from '../ledger/entities/ledger-account.entity';
import { EntryDirection } from '../ledger/entities/ledger-entry.entity';
import { TransactionType, LedgerJournal } from '../ledger/entities/ledger-journal.entity';
import { WalletService, MNX_CURRENCY } from '../wallets/wallet.service';
import { IdempotencyKey } from '../../shared/idempotency/idempotency-key.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentIntent)
    private readonly intentRepo: Repository<PaymentIntent>,
    @InjectRepository(PaymentAttempt)
    private readonly attemptRepo: Repository<PaymentAttempt>,
    @InjectRepository(IdempotencyKey)
    private readonly idempRepo: Repository<IdempotencyKey>,
    @InjectRepository(LedgerJournal)
    private readonly journalRepo: Repository<LedgerJournal>,
    private readonly ledgerService: LedgerService,
    private readonly walletService: WalletService,
  ) {}

  async createPay(
    fromUserId: string,
    toMerchantOrUserId: string,
    amountCents: number,
    idempotencyKeyStr: string,
  ): Promise<PaymentIntent> {
    // 1. Idempotency Check
    let idemp = await this.idempRepo.findOne({ where: { key: idempotencyKeyStr } });
    if (idemp && idemp.status === 'completed') {
      return this.intentRepo.findOne({ where: { id: idemp.response_payload.intentId } }) as any;
    }
    if (!idemp) {
      idemp = this.idempRepo.create({ key: idempotencyKeyStr, status: 'started' });
      await this.idempRepo.save(idemp);
    }

    // 2. Create Intent and Attempt
    const intent = this.intentRepo.create({
      amount: amountCents,
      currency: MNX_CURRENCY,
      customer_id: fromUserId,
      merchant_id: toMerchantOrUserId,
      status: PaymentStatus.PENDING,
    });
    await this.intentRepo.save(intent);

    const attempt = this.attemptRepo.create({
      payment_intent: intent,
      idempotency_key: idempotencyKeyStr,
      status: AttemptStatus.PROCESSING,
    });
    await this.attemptRepo.save(attempt);

    // 3. Execute via Ledger (we bypass HOLD for now and Capture directly for MVP)
    try {
      await this.walletService.getOrCreate(fromUserId, 'user');
      await this.walletService.getOrCreate(toMerchantOrUserId, 'merchant'); // treating generic recipient as merchant

      const fromAccount = await this.ledgerService.findOrCreateAccount(
        fromUserId, 'user', LedgerAccountType.LIABILITY, MNX_CURRENCY,
      );
      const toAccount = await this.ledgerService.findOrCreateAccount(
        toMerchantOrUserId, 'merchant', LedgerAccountType.LIABILITY, MNX_CURRENCY,
      );

      await this.ledgerService.recordJournal(
        TransactionType.PAYMENT,
        [
          { accountId: fromAccount.id, direction: EntryDirection.DEBIT, amount: amountCents },
          { accountId: toAccount.id, direction: EntryDirection.CREDIT, amount: amountCents },
        ],
        `Payment ${intent.id}`,
      );

      // Success
      intent.status = PaymentStatus.CAPTURED;
      attempt.status = AttemptStatus.SUCCEEDED;
    } catch (error: any) {
      // Failure
      intent.status = PaymentStatus.FAILED;
      attempt.status = AttemptStatus.FAILED;
      attempt.error_message = error.message;
    }

    await this.intentRepo.save(intent);
    await this.attemptRepo.save(attempt);

    // Update Idempotency
    idemp.status = 'completed';
    idemp.response_payload = { intentId: intent.id };
    await this.idempRepo.save(idemp);

    return intent;
  }

  async getHistory(ownerId: string, limit = 10): Promise<any[]> {
    // Resolving history via ledger entries for generic tracing
    const qb = this.journalRepo.createQueryBuilder('journal')
      .leftJoinAndSelect('journal.entries', 'entry')
      .leftJoinAndSelect('entry.account', 'account')
      .where('account.owner_id = :ownerId', { ownerId })
      .orderBy('journal.created_at', 'DESC')
      .take(limit);

    const journals = await qb.getMany();
    return journals.map((j) => {
      const myEntry = j.entries.find((e) => e.account.owner_id === ownerId);
      const otherEntry = j.entries.find((e) => e.account.owner_id !== ownerId);
      
      return {
        id: j.id,
        type: j.transaction_type,
        amount: myEntry?.amount ?? 0,
        direction: myEntry?.direction,
        description: j.description,
        otherParty: otherEntry?.account.name,
        date: j.created_at,
      };
    });
  }
}
