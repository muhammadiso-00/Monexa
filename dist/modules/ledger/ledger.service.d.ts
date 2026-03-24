import { DataSource, Repository } from 'typeorm';
import { LedgerAccount, LedgerAccountType } from './entities/ledger-account.entity';
import { LedgerJournal, TransactionType } from './entities/ledger-journal.entity';
import { EntryDirection } from './entities/ledger-entry.entity';
export interface LedgerEntryInput {
    accountId: string;
    direction: EntryDirection;
    amount: number;
}
export declare class LedgerService {
    private readonly dataSource;
    private readonly accountRepo;
    private readonly logger;
    constructor(dataSource: DataSource, accountRepo: Repository<LedgerAccount>);
    recordJournal(type: TransactionType, entries: LedgerEntryInput[], description?: string): Promise<LedgerJournal>;
    findOrCreateAccount(ownerId: string, ownerType: string, type: LedgerAccountType, currency?: string): Promise<LedgerAccount>;
}
