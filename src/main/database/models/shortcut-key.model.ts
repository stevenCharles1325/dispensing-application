/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  Relation,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { User } from './user.model';
import { MinLength } from 'class-validator';
import { ValidationMessage } from '../../app/validators/message/message';

@Entity('shortcut_keys')
export class ShortcutKey {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    nullable: true,
  })
  system_id: number;

  @Column({
    nullable: false,
  })
  user_id: number;

  @Column({ unique: true })
  @MinLength(1, { message: ValidationMessage.minLength })
  key: string;

  @Column({ unique: true })
  @MinLength(1, { message: ValidationMessage.minLength })
  key_combination: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne('User', (user: User) => user.shortcut_keys)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Relation<User>;
}