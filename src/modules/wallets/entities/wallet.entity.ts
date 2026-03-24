import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('wallets')
@Unique(['owner_id', 'currency']) // A user/merchant should only have one wallet per currency
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // owner_id links to either Users or Merchants
  @Column({ type: 'varchar', length: 255 })
  owner_id: string;

  @Column({ type: 'varchar', length: 50 })
  owner_type: 'user' | 'merchant' | 'system';

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  // Actual spendable balance natively linked to the ledger (sum of ledger entries)
  @Column({ type: 'int', default: 0 })
  available_balance: number;

  // Funds currently processing or reserved
  @Column({ type: 'int', default: 0 })
  held_balance: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
