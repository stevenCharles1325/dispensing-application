/* eslint-disable prefer-destructuring */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/prefer-default-export */
import {
  Column,
  Entity,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  AfterLoad,
  Relation,
} from 'typeorm';
import { IsIn, IsPositive, IsNotEmpty, ValidateIf } from 'class-validator';
import { ValidationMessage } from '../../app/validators/message/message';
import { GlobalStorage } from 'Main/stores';
import transactionCategories from 'Main/data/defaults/categories/transaction';
import transactionTypes from 'Main/data/defaults/types/transaction';
import paymentTypes from 'Main/data/defaults/types/payment';

import type { Order } from './order.model';
import type { System } from './system.model';
import type { User } from './user.model';
import TransactionDTO from 'App/data-transfer-objects/transaction.dto';

@Entity('transactions')
export class Transaction {
  @AfterLoad()
  async getOrdersForCustomerPayment() {
    if (this.type === 'customer-payment') {
      const OrderRepository = global.datasource.getRepository('orders');
      const orders = await OrderRepository.createQueryBuilder('order')
        .where('order.transaction_id = :transactionId')
        .setParameter('transactionId', this.id)
        .getMany();

      this.orders = orders as Order[];
    }
  }

  @AfterLoad()
  async getUser() {
    if (!this.creator) {
      const manager = global.datasource.createEntityManager();
      const rawData: any[] = await manager.query(
        `SELECT * FROM 'users' WHERE id = ${this.creator_id}`
      );

      this.creator = rawData[0] as User;
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

  @Column('numeric', {
    nullable: true,
    precision: 7,
    scale: 2,
    transformer: {
      to: (data: number): number => data,
      from: (data: string): number => parseFloat(data),
    },
  })
  @ValidateIf((transaction: TransactionDTO) =>
    transaction.type === 'customer-payment'
  )
  @IsPositive({
    message: ValidationMessage.positive,
  })
  amount_received: number;

  @Column('numeric', {
    nullable: true,
    precision: 7,
    scale: 2,
    transformer: {
      to: (data: number): number => data,
      from: (data: string): number => parseFloat(data),
    },
  })
  @ValidateIf((transaction: TransactionDTO) =>
    Boolean(transaction.type === 'customer-payment' && transaction.amount_received)
  )
  @IsPositive({
    message: ValidationMessage.positive,
  })
  change: number;

  @Column('numeric', {
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
  total: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne('System', { eager: true })
  @JoinColumn({ name: 'system_id', referencedColumnName: 'id' })
  system: Relation<System>;

  @OneToOne('User', { eager: true })
  @JoinColumn({ name: 'creator_id', referencedColumnName: 'id' })
  creator: Relation<User>;

  @OneToMany('Order', (order: Order) => order.transaction, {
    eager: true,
  })
  @JoinColumn({ name: 'id', referencedColumnName: 'transaction_id' })
  orders: Relation<Order>[];
}
