import { LedgerService } from '../ledger/ledger.service';
import { WalletService } from '../wallets/wallet.service';
import { User } from '../auth/entities/user.entity';
export declare class TransfersService {
    private readonly ledgerService;
    private readonly walletService;
    constructor(ledgerService: LedgerService, walletService: WalletService);
    transferMnx(fromUser: User, toUser: User, amountCents: number): Promise<void>;
}
