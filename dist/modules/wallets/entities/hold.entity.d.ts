import { Wallet } from './wallet.entity';
export declare enum HoldStatus {
    ACTIVE = "active",
    RELEASED = "released",
    CAPTURED = "captured"
}
export declare class Hold {
    id: string;
    wallet: Wallet;
    amount: number;
    status: HoldStatus;
    description: string;
    created_at: Date;
    expires_at: Date;
}
