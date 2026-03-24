import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LedgerJournal } from './ledger-journal.entity';
import { LedgerAccount } from './ledger-account.entity';

export enum EntryDirection {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

@Entity('ledger_entries')
export class LedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LedgerJournal, (journal) => journal.entries, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'journal_id' })
  journal: LedgerJournal;

  @ManyToOne(() => LedgerAccount, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ledger_account_id' })
  account: LedgerAccount;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'enum', enum: EntryDirection })
  direction: EntryDirection;

  @CreateDateColumn()
  created_at: Date;
}
