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
  AfterInsert,
  AfterLoad,
} from 'typeorm';
import { IsIn, IsPositive, IsNotEmpty } from 'class-validator';
import { ValidationMessage } from './validator/message/message';
import { System } from './system.model';
import { User } from './user.model';
import transactionCategories from 'Main/data/defaults/categories/transaction';
import transactionTypes from 'Main/data/defaults/types/transaction';
import paymentTypes from 'Main/data/defaults/types/payment';
import { SqliteDataSource } from 'Main/datasource';
import { Order } from './order.model';
import OrderRepository from 'App/repositories/order.repository';

@Entity('transactions')
export class Transaction {
  @AfterLoad()
  async getOrdersForCustomerPayment() {
    if (this.type === 'customer-payment') {
      const orders = await OrderRepository.createQueryBuilder('order')
        .where('order.transaction_id = :transactionId')
        .setParameter('transactionId', this.id)
        .getMany();

      this.orders = orders;
    }
  }

  @AfterLoad()
  async getUser() {
    if (!this.creator) {
      const manager = SqliteDataSource.createEntityManager();
      const rawData: any[] = await manager.query(
        `SELECT * FROM 'users' WHERE id = ${this.creator_id}`
      );

      this.creator = rawData[0];
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

  @OneToOne(() => System, { eager: true })
  @JoinColumn({ name: 'system_id', referencedColumnName: 'id' })
  system: System;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'creator_id', referencedColumnName: 'id' })
  creator: User;

  @OneToMany(() => Order, (order) => order.transaction, {
    eager: true,
  })
  @JoinColumn({ name: 'id', referencedColumnName: 'transaction_id' })
  orders: Order[];
}
