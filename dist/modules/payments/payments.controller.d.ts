import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createPayment(body: {
        from: string;
        to: string;
        amount: number;
        idempotencyKey: string;
    }): Promise<import("./entities/payment-intent.entity").PaymentIntent>;
    getHistory(userId: string, limitStr?: string): Promise<any[]>;
}
