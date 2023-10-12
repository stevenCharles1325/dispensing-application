/* eslint-disable no-use-before-define */
/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsMobilePhone, Length, IsEmail, MinLength } from 'class-validator';
import { ValidationMessage } from './validator/message';
import { Image } from './image.model';
import { System } from './system.model';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  system_id: number | null;

  @Column({
    type: Number,
    nullable: true,
    default: null,
  })
  image_id: number | null;

  @Column({
    nullable: true,
  })
  tax_id: number;

  @Column()
  @Length(3, 20, {
    message: ValidationMessage.maxLength,
  })
  name: string;

  @Column()
  @Length(13, undefined, {
    message: ValidationMessage.length,
  }) // 13 characters including "+" sign.
  @IsMobilePhone(
    'en-PH',
    {
      strictMode: true,
    },
    {
      message: ValidationMessage.mobileNumber,
    }
  )
  phone_number: string;

  @Column({ unique: true })
  @IsEmail(undefined, {
    message: ValidationMessage.email,
  })
  email: string;

  @Column()
  @Length(3, 20, {
    message: ValidationMessage.maxLength,
  })
  contact_name: string;

  @Column()
  @Length(13, undefined, {
    message: ValidationMessage.length,
  }) // 13 characters including "+" sign.
  @IsMobilePhone(
    'en-PH',
    {
      strictMode: true,
    },
    {
      message: ValidationMessage.mobileNumber,
    }
  )
  contact_phone_number: string;

  @Column({ unique: true })
  @IsEmail(undefined, {
    message: ValidationMessage.email,
  })
  contact_email: string;

  @Column()
  @MinLength(10, {
    message: ValidationMessage.minLength,
  })
  address: string;

  @Column()
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  @DeleteDateColumn()
  deleted_at: Date;

  @OneToOne(() => Image, { eager: true })
  @JoinColumn({ name: 'image_id', referencedColumnName: 'id' })
  image: Image;

  @OneToOne(() => System, { eager: true })
  @JoinColumn({ name: 'system_id', referencedColumnName: 'id' })
  system: System;
}
