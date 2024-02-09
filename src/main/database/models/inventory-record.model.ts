/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  Relation,
  JoinColumn,
  ManyToOne,
  AfterLoad,
  BeforeInsert,
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
import Provider from '@IOC:Provider';
import UserDTO from 'App/data-transfer-objects/user.dto';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import measurements from 'Main/data/defaults/unit-of-measurements';

@Entity('inventory_records')
export class InventoryRecord {
  @AfterLoad()
  async getItem() {
    if (!this.creator) {
      const manager = global.datasource.createEntityManager();
      const rawData: any[] = await manager.query(
        `SELECT * FROM 'items' WHERE id = '${this.item_id}'`
      );

      // To-filter-out all unnecessary properties
      this.item = rawData[0] as Item;
    }
  }

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

  @BeforeInsert()
  async getUserData() {
    if (this.creator_id) return;

    const authService = Provider.ioc<IAuthService>('AuthProvider');
    const token = authService.getAuthToken?.()?.token;

    const authResponse = authService.verifyToken(token);

    if (authResponse.status === 'SUCCESS') {
      const user = authResponse.data as UserDTO;
      this.creator_id = user.id;
    }
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
  })
  item_id: string;

  @Column({
    nullable: true,
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
  quantity: number;

  @Column()
  @IsIn(measurements, {
    message: ValidationMessage.isIn,
  })
  unit_of_measurement: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne('Item', (item: Item) => item.records)
  @JoinColumn({ name: 'item_id', referencedColumnName: 'id' })
  item: Relation<Item>;

  @ManyToOne('User', (creator: User) => creator.stock_records)
  @JoinColumn({ name: 'creator_id', referencedColumnName: 'id' })
  creator: Relation<User>;
}
