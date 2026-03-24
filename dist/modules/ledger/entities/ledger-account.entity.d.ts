export declare enum LedgerAccountType {
    ASSET = "asset",
    LIABILITY = "liability",
    REVENUE = "revenue",
    EXPENSE = "expense"
}
export declare class LedgerAccount {
    id: string;
    name: string;
    type: LedgerAccountType;
    owner_id: string;
    currency: string;
    created_at: Date;
}
