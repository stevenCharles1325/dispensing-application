/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.model';
import { MinLength } from 'class-validator';

const messages = {
  minLength: 'Length must be at least $constraint1',
};

@Entity('permissions')
export class Permission {
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
  name: string;

  @Column()
  description: string;

  @Column()
  cost_price: number;

  @Column()
  selling_price: number;

  @Column()
  tax_rate: number;

  @Column()
  unit_of_measurement:
    | 'millimeters'
    | 'centimeters'
    | 'meters'
    | 'feet'
    | 'yards'

    // Weight/Mass
    | 'milligrams'
    | 'grams'
    | 'kilograms'
    | 'ounces'
    | 'pounds'

    // Volume/Capacity
    | 'milliliters'
    | 'liters'
    | 'cubic-centimeters'
    | 'cubic-meters'
    | 'fluid-ounces'
    | 'gallons'

    // Area
    | 'square-millimeters'
    | 'square-centimeters'
    | 'square-meters'
    | 'square-inches'
    | 'square-feet'
    | 'square-yards'

    // Count/Quantity
    | 'each'
    | 'dozen'
    | 'gross'
    | 'pack'
    | 'pair';

  @Column()
  barcode: string;

  @Column()
  stock_quantity: number;

  @Column()
  status:
    | 'available'
    | 'on-hold'
    | 'out-of-stock'
    | 'discontinued'
    | 'awaiting-shipment';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
