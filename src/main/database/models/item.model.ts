/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  OneToOne,
  Relation,
  OneToMany,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  AfterInsert,
  BeforeUpdate,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  Length,
  IsPositive,
  IsNotEmpty,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { Bull } from 'Main/jobs';
import { ValidationMessage } from '../../app/validators/message/message';
import measurements from 'Main/data/defaults/unit-of-measurements';
import itemStatuses from 'Main/data/defaults/statuses/item';
import { IsBarcode } from '../../app/validators/IsBarcode';
import ItemDTO from 'App/data-transfer-objects/item.dto';
import type { System } from './system.model';
import type { Image } from './image.model';
import type { Supplier } from './supplier.model';
import type { Brand } from './brand.model';
import type { Category } from './category.model';
import type { InventoryRecord } from './inventory-record.model';
import type { Discount } from './discount.model';

@Entity('items')
export class Item {
  @BeforeUpdate()
  async notifyIfRunningOut() {
    if (this.stock_quantity <= 0) {
      await Bull(
        'NOTIF_JOB',
        {
          title: `An item is out-of-stock`,
          description: `An item named ${this.name} is out-of-stock now`,
          link: `/inventory?id=${this.id}`,
          is_system_generated: true,
          status: 'UNSEEN',
          type: 'ERROR',
        }
      );
    }
  }

  @BeforeUpdate()
  updateStatus() {
    if (this.stock_quantity <= 0) {
      this.status = 'out-of-stock';
    } else if (this.stock_quantity > 0 && this.status === 'out-of-stock') {
      this.status = 'available';
    }
  }

  @AfterInsert()
  async addStockInInitialRecord() {
    await Bull(
      'STOCK_JOB',
      {
        item_id: this.id,
        purpose: 'initial-stock',
        quantity: this.stock_quantity,
        type: 'stock-in',
      }
    );
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  system_id: number;

  @Column({ nullable: true })
  discount_id: number;

  @Column({ nullable: true })
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
  @ValidateIf((item: ItemDTO) => Boolean(item.description.length))
  @Length(5, 1000, {
    message: ValidationMessage.maxLength,
  })
  description: string;

  @Column('numeric', {
    nullable: true,
    precision: 7,
    scale: 2,
    transformer: {
      to: (data: number): number => data,
      from: (data: string): number => parseFloat(data),
    },
  })
  @IsPositive({
    message: ValidationMessage.positive,
  })
  cost_price: number;

  @Column('numeric', {
    nullable: true,
    precision: 7,
    scale: 2,
    transformer: {
      to: (data: number): number => data,
      from: (data: string): number => parseFloat(data),
    },
  })
  @IsPositive({
    message: ValidationMessage.positive,
  })
  selling_price: number;

  @Column('numeric', {
    nullable: true,
    precision: 7,
    scale: 2,
    transformer: {
      to: (data: number): number => data,
      from: (data: string): number => parseFloat(data),
    },
  })
  tax_rate: number;

  @Column()
  @IsIn(measurements, {
    message: ValidationMessage.measurements,
  })
  unit_of_measurement: string;

  @Column({ nullable: true })
  @ValidateIf((item: ItemDTO) => Boolean(item.barcode.length))
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

  @OneToOne('Image', {
    eager: true,
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'image_id', referencedColumnName: 'id' })
  image?: Relation<Image>;

  @OneToOne('Brand', { eager: true, cascade: true })
  @JoinColumn({ name: 'brand_id', referencedColumnName: 'id' })
  brand: Relation<Brand>;

  @ManyToOne('Category', {
    eager: true,
    cascade: true,
  })
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category: Relation<Category>;

  @OneToOne('Supplier', { eager: true, cascade: true, nullable: true })
  @JoinColumn({ name: 'supplier_id', referencedColumnName: 'id' })
  supplier?: Relation<Supplier>;

  @OneToOne('System', { eager: true })
  @JoinColumn({ name: 'system_id', referencedColumnName: 'id' })
  system: Relation<System>;

  @OneToMany('InventoryRecord', (record: InventoryRecord) => record.item, {
    eager: true,
  })
  @JoinColumn({ name: 'id', referencedColumnName: 'item_id' })
  records: Relation<InventoryRecord>[];

  @ManyToOne('Discount', {
    eager: true,
    cascade: true,
  })
  @JoinColumn({ name: 'discount_id', referencedColumnName: 'id' })
  discount?: Relation<Discount> | null;

  // Custom functions
  async purchase(quantity: number = 1) {
    this.stock_quantity -= quantity;

    await Bull(
      'STOCK_JOB',
      {
        item_id: this.id,
        purpose: 'sold',
        quantity,
        type: 'stock-out',
      }
    );

    if (this.stock_quantity > 15 && this.stock_quantity <= 20) {
      await Bull(
        'NOTIF_JOB',
        {
          title: `An item is running out-of-stock`,
          description: `An item named ${this.name} is running out-of-stock`,
          link: `/inventory?id=${this.id}`,
          status: 'UNSEEN',
          is_system_generated: true,
          type: 'WARNING',
        }
      );
    }
  }
}
