import { PaymentIntent } from './payment-intent.entity';
export declare enum AttemptStatus {
    PROCESSING = "processing",
    SUCCEEDED = "succeeded",
    FAILED = "failed"
}
export declare class PaymentAttempt {
    id: string;
    payment_intent: PaymentIntent;
    idempotency_key: string;
    status: AttemptStatus;
    error_code: string;
    error_message: string;
    created_at: Date;
}
