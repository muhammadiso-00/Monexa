import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  username: string | null;

  @Column({ type: 'bigint', nullable: true, unique: true })
  telegram_id: number | null;

  @Column({ type: 'varchar', length: 32, nullable: true, unique: true })
  phone: string | null;

  @Column({ type: 'boolean', default: false })
  is_frozen: boolean;

  @CreateDateColumn()
  created_at: Date;
}
