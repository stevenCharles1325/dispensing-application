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

import { Length, IsPositive, IsNotEmpty, IsIn } from 'class-validator';
import { ValidationMessage } from './validator/message/message';
import measurements from 'Main/data/defaults/unit-of-measurements';
import itemStatuses from 'Main/data/defaults/statuses/item';
import { System } from './system.model';
import { Image } from './image.model';
import { Supplier } from './supplier.model';
import { Brand } from './brand.model';
import { Category } from './category.model';
import { IsBarcode } from './validator/IsBarcode';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  system_id: number;

  @Column()
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  supplier_id: string;

  @Column({
    nullable: true,
  })
  image_id: number;

  @Column()
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  category_id: number;

  @Column()
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  brand_id: number;

  @Column({
    unique: true,
  })
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
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
  @IsPositive({
    message: ValidationMessage.positive,
  })
  cost_price: number;

  @Column()
  @IsPositive({
    message: ValidationMessage.positive,
  })
  selling_price: number;

  @Column()
  @IsPositive({
    message: ValidationMessage.positive,
  })
  tax_rate: number;

  @Column()
  @IsIn(measurements, {
    message: ValidationMessage.measurements,
  })
  unit_of_measurement: string;

  @Column()
  @IsBarcode({
    message: ValidationMessage.invalid,
  })
  barcode: string;

  @Column()
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
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

  @OneToOne(() => Image, { eager: true })
  @JoinColumn({ name: 'image_id', referencedColumnName: 'id' })
  image: Image;

  @OneToOne(() => Brand, { eager: true })
  @JoinColumn({ name: 'brand_id', referencedColumnName: 'id' })
  brand: Brand;

  @OneToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category: Category;

  @OneToOne(() => Supplier, { eager: true })
  @JoinColumn({ name: 'supplier_id', referencedColumnName: 'id' })
  supplier: Image;

  @OneToOne(() => System, { eager: true })
  @JoinColumn({ name: 'system_id', referencedColumnName: 'id' })
  system: System;
}
