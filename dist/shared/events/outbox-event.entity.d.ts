export declare class OutboxEvent {
    id: string;
    topic: string;
    payload: any;
    status: 'pending' | 'processed' | 'failed';
    created_at: Date;
    processed_at: Date;
}
