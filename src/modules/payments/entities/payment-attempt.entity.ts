import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PaymentIntent } from './payment-intent.entity';

export enum AttemptStatus {
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

@Entity('payment_attempts')
export class PaymentAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PaymentIntent, (intent) => intent.attempts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_intent_id' })
  payment_intent: PaymentIntent;

  // The link to the idempotency key used for this attempt
  @Column({ type: 'varchar', length: 255 })
  idempotency_key: string;

  @Column({ type: 'enum', enum: AttemptStatus, default: AttemptStatus.PROCESSING })
  status: AttemptStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  error_code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  error_message: string;

  @CreateDateColumn()
  created_at: Date;
}
