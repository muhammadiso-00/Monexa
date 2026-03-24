export declare class IdempotencyKey {
    key: string;
    request_payload: any;
    response_payload: any;
    status: 'started' | 'completed' | 'failed';
    created_at: Date;
    locked_at: Date;
}
