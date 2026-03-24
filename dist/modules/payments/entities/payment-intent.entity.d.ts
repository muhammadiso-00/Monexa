import { PaymentAttempt } from './payment-attempt.entity';
export declare enum PaymentStatus {
    CREATED = "created",
    PENDING = "pending",
    REQUIRES_ACTION = "requires_action",
    AUTHORIZED = "authorized",
    CAPTURED = "captured",
    FAILED = "failed",
    CANCELED = "canceled",
    REFUNDED = "refunded"
}
export declare class PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    customer_id: string;
    merchant_id: string;
    status: PaymentStatus;
    attempts: PaymentAttempt[];
    created_at: Date;
    updated_at: Date;
}
