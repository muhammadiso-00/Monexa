import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Wallet } from './wallet.entity';

export enum HoldStatus {
  ACTIVE = 'active',
  RELEASED = 'released',
  CAPTURED = 'captured',
}

@Entity('holds')
export class Hold {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Wallet, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'enum', enum: HoldStatus, default: HoldStatus.ACTIVE })
  status: HoldStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;
}
