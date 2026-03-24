import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { LedgerService } from '../ledger/ledger.service';
export declare const MNX_CURRENCY = "MNX";
export declare function toMnxCents(mnx: number): number;
export declare function formatMnx(cents: number): string;
export declare class WalletService {
    private readonly walletRepo;
    private readonly ledgerService;
    constructor(walletRepo: Repository<Wallet>, ledgerService: LedgerService);
    getOrCreate(ownerId: string, ownerType: 'user' | 'merchant' | 'system'): Promise<Wallet>;
    getBalance(ownerId: string): Promise<{
        available: number;
        held: number;
        total: number;
    }>;
    adminDeposit(userId: string, amountCents: number): Promise<void>;
}
