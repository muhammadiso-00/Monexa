import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum LedgerAccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  REVENUE = 'revenue',
  EXPENSE = 'expense',
}

@Entity('ledger_accounts')
export class LedgerAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: LedgerAccountType })
  type: LedgerAccountType;

  // Polymorphic association (Points to a User ID, Merchant ID, or System string)
  @Column({ type: 'varchar', length: 255, nullable: true })
  owner_id: string;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @CreateDateColumn()
  created_at: Date;
}
