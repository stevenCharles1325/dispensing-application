/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  Relation,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  MinLength,
  ValidateIf,
  IsPositive,
  IsIn,
} from 'class-validator';
import { ValidationMessage } from '../../app/validators/message/message';
import type { Item } from './item.model';

@Entity('inventory_records')
export class InventoryRecord {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    nullable: true,
  })
  item_id: string;

  @Column()
  @MinLength(3, { message: ValidationMessage.minLength })
  purpose: string;

  @Column({ nullable: true })
  @ValidateIf((inventoryRecord) => Boolean(inventoryRecord.note?.length))
  @MinLength(5, { message: ValidationMessage.minLength })
  note: string;

  @Column({ nullable: true })
  @IsIn(
    ['stock-in', 'stock-out'],
    {
      message: ValidationMessage.isIn,
    }
  )
  type: string;

  @Column({ nullable: true })
  @IsPositive({
    message: ValidationMessage.positive,
  })
  quantity: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne('Item', (item: Item) => item.records)
  @JoinColumn({ name: 'item_id', referencedColumnName: 'id' })
  item: Relation<Item>;
}