import { Repository } from 'typeorm';
import { PaymentIntent } from './entities/payment-intent.entity';
import { PaymentAttempt } from './entities/payment-attempt.entity';
import { LedgerService } from '../ledger/ledger.service';
import { LedgerJournal } from '../ledger/entities/ledger-journal.entity';
import { WalletService } from '../wallets/wallet.service';
import { IdempotencyKey } from '../../shared/idempotency/idempotency-key.entity';
export declare class PaymentsService {
    private readonly intentRepo;
    private readonly attemptRepo;
    private readonly idempRepo;
    private readonly journalRepo;
    private readonly ledgerService;
    private readonly walletService;
    constructor(intentRepo: Repository<PaymentIntent>, attemptRepo: Repository<PaymentAttempt>, idempRepo: Repository<IdempotencyKey>, journalRepo: Repository<LedgerJournal>, ledgerService: LedgerService, walletService: WalletService);
    createPay(fromUserId: string, toMerchantOrUserId: string, amountCents: number, idempotencyKeyStr: string): Promise<PaymentIntent>;
    getHistory(ownerId: string, limit?: number): Promise<any[]>;
}
