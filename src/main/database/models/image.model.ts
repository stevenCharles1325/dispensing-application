/* eslint-disable import/prefer-default-export */
import {
  OneToOne,
  JoinColumn,
  Column,
  Entity,
  Relation,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MinLength } from 'class-validator';
import { ValidationMessage } from '../../app/validators/message/message';
import type { User } from './user.model';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  uploader_id: string;

  @Column({ unique: true })
  url: string;

  @Column()
  type: string;

  @Column()
  bucket_name: string;

  @Column({ unique: true })
  @MinLength(5, { message: ValidationMessage.minLength })
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  @DeleteDateColumn()
  deleted_at: Date;

  @OneToOne('User')
  @JoinColumn({ name: 'uploader_id', referencedColumnName: 'id' })
  uploader: Relation<User>;
}
