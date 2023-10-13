/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MinLength } from 'class-validator';
import { ValidationMessage } from './validator/message/message';

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  system_id: number;

  @Column({ unique: true })
  @MinLength(5, { message: ValidationMessage.minLength })
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  @DeleteDateColumn()
  deleted_at: Date;
}
