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
  AfterLoad,
  AfterInsert,
  BeforeUpdate,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  Length,
  IsNotEmpty,
  IsIn,
  Min,
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
import Provider from '@IOC:Provider';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import UserDTO from 'App/data-transfer-objects/user.dto';
import { IItemMeasurement } from 'App/interfaces/item/item.measurements.interface';
import unitQuantityCalculator from 'App/modules/unit-quantity-calculator.module';
import getUOFSymbol from 'App/modules/get-uof-symbol.module';

@Entity('items')
export class Item {
  discounted_selling_price: number;

  @AfterLoad()
  async getSystem() {
    if (!this.system) {
      const manager = global.datasource.createEntityManager();
      const rawData: any[] = await manager.query(
        `SELECT * FROM 'systems' WHERE id = '${this.system_id}'`
      );

      this.system = rawData[0] as System;
    }
  }

  @AfterLoad()
  async getSSupplier() {
    if (!this.supplier) {
      const manager = global.datasource.createEntityManager();
      const rawData: any[] = await manager.query(
        `SELECT * FROM 'suppliers' WHERE id = '${this.supplier_id}'`
      );

      this.supplier = rawData[0] as Supplier;
    }
  }

  @AfterLoad()
  async getDiscount() {
    if (this.discount_id) {
      const manager = global.datasource.createEntityManager();
      const rawData: any[] = await manager.query(
        `SELECT * FROM 'discounts' WHERE id = '${this.discount_id}'`
      );

      const discount = rawData[0] as Discount;
      if (discount.status === 'active') {
        this.discount = discount;
      }

      if (this.discount?.status === 'active') {
        if (this.discount?.discount_type === 'percentage-off') {
          const discount = this.selling_price * (this.discount.discount_value / 100);
          this.discounted_selling_price = this.selling_price - discount;
        } else if (this.discount?.discount_type === 'fixed-amount-off') {
          this.discounted_selling_price = this.selling_price - this.discount.discount_value;
        }
      }
    }
  }

  @AfterLoad()
  async getBrand() {
    if (this.brand_id) {
      const manager = global.datasource.createEntityManager();
      const rawData: any[] = await manager.query(
        `SELECT * FROM 'brands' WHERE id = '${this.brand_id}'`
      );

      const brand = rawData[0] as Brand;
      this.brand = brand;
    }
  }

  @AfterLoad()
  async getCategory() {
    if (this.category_id) {
      const manager = global.datasource.createEntityManager();
      const rawData: any[] = await manager.query(
        `SELECT * FROM 'categories' WHERE id = '${this.category_id}'`
      );

      const category = rawData[0] as Category;
      this.category = category;
    }
  }

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
        unit_of_measurement: this.unit_of_measurement,
        type: 'stock-in',
      }
    );
  }

  @BeforeInsert()
  async getSystemData() {
    const authService = Provider.ioc<IAuthService>('AuthProvider');
    const token = authService.getAuthToken?.()?.token;

    const authResponse = authService.verifyToken(token);

    if (authResponse.status === 'SUCCESS' && !this.system_id) {
      const user = authResponse.data as UserDTO;
      this.system_id = user.system_id;
    }
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  item_code: string;

  @Column({ nullable: true })
  batch_code: string;

  @Column({ nullable: true })
  system_id: string;

  @Column({ nullable: true })
  discount_id: string;

  @Column({ nullable: true })
  supplier_id: string;

  @Column({
    nullable: true,
  })
  image_id: string;

  @Column()
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  category_id: string;

  @Column()
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  brand_id: string;

  @Column({
    nullable: true,
  })
  sku: string;

  @Column()
  @Length(3, 50, {
    message: ValidationMessage.maxLength,
  })
  name: string;

  @Column()
  @ValidateIf((item: ItemDTO) => Boolean(item?.description?.length))
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
      from: (data: string): number => parseFloat(data ?? '0'),
    },
    default: 0,
  })
  cost_price: number;

  @Column('numeric', {
    nullable: true,
    precision: 7,
    scale: 2,
    transformer: {
      to: (data: number): number => data,
      from: (data: string): number => parseFloat(data  ?? '0'),
    },
    default: 0,
  })
  selling_price: number;

  @Column('numeric', {
    nullable: true,
    precision: 7,
    scale: 2,
    transformer: {
      to: (data: number): number => data,
      from: (data: string): number => parseFloat(data ?? '0'),
    },
    default: 0,
  })
  tax_rate: number;

  @Column()
  @IsIn(measurements, {
    message: ValidationMessage.measurements,
  })
  unit_of_measurement: string;

  @Column({ nullable: true })
  @ValidateIf((item: ItemDTO) => Boolean(item?.barcode?.length))
  @IsBarcode({
    message: ValidationMessage.invalid,
  })
  barcode: string;

  @Column('numeric', {
    nullable: true,
    precision: 7,
    scale: 2,
    transformer: {
      to: (data: number): number => data,
      from: (data: string): number => parseFloat(data),
    },
  })
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  @Min(0, {
    message: ValidationMessage.positive,
  })
  stock_quantity: number;

  @Column()
  @IsIn(itemStatuses, {
    message: ValidationMessage.status,
  })
  status: string;

  @Column()
  expired_at: Date;

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
  async purchase(quantity: number = 1, unit_of_measurement: IItemMeasurement) {
    if (
      this.discount?.discount_type === 'buy-one-get-one' &&
      this.discount?.status === 'active'
    ) {
      quantity *= 2;
      this.stock_quantity -= quantity;

      await Bull(
        'STOCK_JOB',
        {
          item_id: this.id,
          purpose: 'sold (buy-one-get-one)',
          quantity,
          // unit_of_measurement: this.unit_of_measurement,
          type: 'stock-out',
        }
      );
    } else {
      const leftOperand = {
        quantity: this.stock_quantity,
        unit: this.unit_of_measurement,
      }

      const rightOperand = {
        quantity,
        unit: unit_of_measurement,
      }

      const [qt, um] = unitQuantityCalculator(
        leftOperand,
        rightOperand,
        getUOFSymbol,
        'sub'
      );

      this.stock_quantity = qt;
      this.unit_of_measurement = um;

      await Bull(
        'STOCK_JOB',
        {
          item_id: this.id,
          purpose: 'dispensed',
          quantity,
          unit_of_measurement: um,
          type: 'stock-out',
        }
      );
    }

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
