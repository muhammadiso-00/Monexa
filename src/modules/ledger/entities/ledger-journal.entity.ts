import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { LedgerEntry } from './ledger-entry.entity';

export enum TransactionType {
  DEPOSIT = 'deposit',
  PAYMENT = 'payment',
  REFUND = 'refund',
  PAYOUT = 'payout',
  FEE = 'fee',
  HOLD = 'hold',
  RELEASE = 'release',
}

@Entity('ledger_journals')
export class LedgerJournal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TransactionType })
  transaction_type: TransactionType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @OneToMany(() => LedgerEntry, (entry) => entry.journal, { cascade: true })
  entries: LedgerEntry[];

  @CreateDateColumn()
  created_at: Date;
}
