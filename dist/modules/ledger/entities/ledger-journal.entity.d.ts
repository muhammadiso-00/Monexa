import { LedgerEntry } from './ledger-entry.entity';
export declare enum TransactionType {
    DEPOSIT = "deposit",
    PAYMENT = "payment",
    REFUND = "refund",
    PAYOUT = "payout",
    FEE = "fee",
    HOLD = "hold",
    RELEASE = "release"
}
export declare class LedgerJournal {
    id: string;
    transaction_type: TransactionType;
    description: string;
    entries: LedgerEntry[];
    created_at: Date;
}
