/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  Relation,
  JoinColumn,
  ManyToOne,
  AfterLoad,
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
import type { User } from './user.model';
import InventoryRecordDTO from 'App/data-transfer-objects/inventory-record.dto';

@Entity('inventory_records')
export class InventoryRecord {
  @AfterLoad()
  async getUser() {
    if (!this.creator) {
      const manager = global.datasource.createEntityManager();
      const rawData: any[] = await manager.query(
        `SELECT * FROM 'users' WHERE id = '${this.creator_id}'`
      );

      // To-filter-out all unnecessary properties
      this.creator = rawData[0] as User;
    }
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
  })
  item_id: string;

  @Column({
    nullable: false,
  })
  creator_id: string;

  @Column()
  @MinLength(3, { message: ValidationMessage.minLength })
  purpose: string;

  @Column({ nullable: true })
  @ValidateIf((inventoryRecord: InventoryRecordDTO) => Boolean(inventoryRecord.note?.length))
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

  @ManyToOne('User', (creator: User) => creator.stock_records)
  @JoinColumn({ name: 'creator_id', referencedColumnName: 'id' })
  creator: Relation<User>;
}
