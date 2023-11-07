/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  Relation,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { User } from './user.model';

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  user_id: number;

  @Column()
  token: string;

  @Column({ nullable: true })
  refresh_token: string;

  @Column()
  token_expires_at: Date;

  @Column()
  refresh_token_expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne('User', { eager: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Relation<User>;
}
