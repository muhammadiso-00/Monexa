import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('idempotency_keys')
export class IdempotencyKey {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  key: string;

  @Column({ type: 'jsonb', nullable: true })
  request_payload: any;

  @Column({ type: 'jsonb', nullable: true })
  response_payload: any;

  @Column({ type: 'varchar', length: 50, default: 'started' })
  status: 'started' | 'completed' | 'failed';

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  locked_at: Date;
}
