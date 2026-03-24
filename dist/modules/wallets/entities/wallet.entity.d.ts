export declare class Wallet {
    id: string;
    owner_id: string;
    owner_type: 'user' | 'merchant' | 'system';
    currency: string;
    available_balance: number;
    held_balance: number;
    created_at: Date;
    updated_at: Date;
}
