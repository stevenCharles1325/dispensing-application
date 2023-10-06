/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Length, IsNegative, IsIn } from 'class-validator';
import { ValidationMessage } from './validator/message';
import measurements from 'Main/data/defaults/unit-of-measurements';
import itemStatuses from 'Main/data/defaults/statuses/item';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({
    nullable: true,
  })
  image_id: number;

  @Column()
  category_id: number;

  @Column()
  brand_id: number;

  @Column()
  supplier_id: number;

  @Column({
    unique: true,
  })
  sku: string;

  @Column()
  @Length(3, 50, {
    message: ValidationMessage.maxLength,
  })
  name: string;

  @Column()
  @Length(5, 1000, {
    message: ValidationMessage.maxLength,
  })
  description: string;

  @Column()
  @IsNegative({
    message: ValidationMessage.negative,
  })
  cost_price: number;

  @Column()
  @IsNegative({
    message: ValidationMessage.negative,
  })
  selling_price: number;

  @Column()
  @IsNegative({
    message: ValidationMessage.negative,
  })
  tax_rate: number;

  @Column()
  @IsIn(measurements, {
    message: ValidationMessage.measurements,
  })
  unit_of_measurement: string;

  @Column()
  barcode: string;

  @Column()
  @IsNegative()
  stock_quantity: number;

  @Column()
  @IsIn(itemStatuses, {
    message: ValidationMessage.status,
  })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  @DeleteDateColumn()
  deleted_at: Date;
}
