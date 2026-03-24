import { LedgerJournal } from './ledger-journal.entity';
import { LedgerAccount } from './ledger-account.entity';
export declare enum EntryDirection {
    CREDIT = "credit",
    DEBIT = "debit"
}
export declare class LedgerEntry {
    id: string;
    journal: LedgerJournal;
    account: LedgerAccount;
    amount: number;
    direction: EntryDirection;
    created_at: Date;
}
