/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MinLength } from 'class-validator';
import { ValidationMessage } from './validator/message/message';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  url: string;

  @Column()
  type: string;

  @Column({ unique: true })
  @MinLength(5, { message: ValidationMessage.minLength })
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  @DeleteDateColumn()
  deleted_at: Date;
}
