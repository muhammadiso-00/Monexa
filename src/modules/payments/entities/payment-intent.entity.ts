import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PaymentAttempt } from './payment-attempt.entity';

export enum PaymentStatus {
  CREATED = 'created',
  PENDING = 'pending',
  REQUIRES_ACTION = 'requires_action',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

@Entity('payment_intents')
export class PaymentIntent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  // Link to user/merchant
  @Column({ type: 'varchar', length: 255 })
  customer_id: string;

  @Column({ type: 'varchar', length: 255 })
  merchant_id: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.CREATED })
  status: PaymentStatus;

  @OneToMany(() => PaymentAttempt, (attempt) => attempt.payment_intent, { cascade: true })
  attempts: PaymentAttempt[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
