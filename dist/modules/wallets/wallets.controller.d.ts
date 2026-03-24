import { WalletService } from './wallet.service';
export declare class WalletsController {
    private readonly walletService;
    constructor(walletService: WalletService);
    getBalance(id: string): Promise<{
        available: number;
        held: number;
        total: number;
    }>;
    deposit(body: {
        userId: string;
        amountCents: number;
    }): Promise<{
        success: boolean;
    }>;
}
