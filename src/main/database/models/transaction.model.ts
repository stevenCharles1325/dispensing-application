/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  AfterInsert,
} from 'typeorm';
import { IsIn, IsPositive, IsNotEmpty } from 'class-validator';
import { ValidationMessage } from './validator/message/message';
import { System } from './system.model';
import { User } from './user.model';
import transactionCategories from 'Main/data/defaults/categories/transaction';
import transactionTypes from 'Main/data/defaults/types/transaction';
import paymentTypes from 'Main/data/defaults/types/payment';
import { IOrderDetails } from 'App/interfaces/pos/pos.order-details.interface';
import ItemRepository from 'App/repositories/item.repository';

@Entity('transactions')
export class Transaction {
  @AfterInsert()
  async updatePurchasedItem() {
    if (this.category === 'income' && this.type === 'customer-payment') {
      const purchase: IOrderDetails = JSON.parse(this.item_details);

      for await (const purchasedItem of purchase.items) {
        const item = await ItemRepository.findOneByOrFail({
          id: purchasedItem.id,
        });

        item.purchase(purchasedItem.quantity);
        await ItemRepository.save(item);
      }
    }
  }

  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    nullable: true,
  })
  system_id: number | null;

  @Column()
  creator_id: number;

  @Column()
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  source_name: string;

  @Column()
  @IsNotEmpty({
    message: ValidationMessage.notEmpty,
  })
  recipient_name: string;

  @Column()
  @IsIn(transactionCategories, {
    message: ValidationMessage.isIn,
  })
  category: string;

  @Column()
  @IsIn(transactionTypes, {
    message: ValidationMessage.isIn,
  })
  type: string;

  @Column()
  @IsIn(paymentTypes, {
    message: ValidationMessage.isIn,
  })
  method: string;

  @Column()
  @IsPositive({
    message: ValidationMessage.positive,
  })
  total: number;

  @Column()
  item_details: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => System, { eager: true })
  @JoinColumn({ name: 'system_id', referencedColumnName: 'id' })
  system: System;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'creator_id', referencedColumnName: 'id' })
  creator: User;
}