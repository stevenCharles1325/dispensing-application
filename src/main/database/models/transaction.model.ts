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
  BeforeInsert,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  AfterLoad,
  AfterInsert,
  Relation,
} from 'typeorm';
import { IsIn, IsPositive, IsNotEmpty, ValidateIf } from 'class-validator';
import { ValidationMessage } from '../../app/validators/message/message';
import transactionCategories from 'Main/data/defaults/categories/transaction';
import transactionTypes from 'Main/data/defaults/types/transaction';
import paymentTypes from 'Main/data/defaults/types/payment';

import type { Order } from './order.model';
import type { System } from './system.model';
import type { User } from './user.model';
import type { Discount } from './discount.model';
import TransactionDTO from 'App/data-transfer-objects/transaction.dto';
import { Bull } from 'Main/jobs';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import Provider from '@IOC:Provider';

@Entity('transactions')
export class Transaction {
  @BeforeInsert()
  async getSystemData() {
    const authService = Provider.ioc<IAuthService>('AuthProvider');
    const token = authService.getAuthToken?.()?.token;

    const authResponse = authService.verifyToken(token);

    if (authResponse.status === 'SUCCESS' && !this.system_id) {
      const user = authResponse.data as UserDTO;
      this.system_id = user.system_id;

      console.log('THIS: ', this);
    }
  }

  @AfterInsert()
  async discountTotalUsageListener() {
    const DiscountRepository = global.datasource.getRepository('discounts');
    const ItemRepository = global.datasource.getRepository('items');
    const items = await ItemRepository.createQueryBuilder()
      .where({
        discount_id: this.discount_id,
      })
      .getMany();
    const discount = await DiscountRepository.createQueryBuilder()
      .where({
        id: this.discount_id,
      })
      .getOne();

    if (discount && discount.total_usage >= discount.usage_limit) {
      discount.status = 'deactivated';

      await Bull(
        'NOTIF_JOB',
        {
          title: `A discount has reached its usage limit`,
          description: `A discount named ${discount.title} has reached its usage limit now`,
          link: null,
          is_system_generated: true,
          status: 'UNSEEN',
          type: 'ERROR',
        }
      );

      await DiscountRepository.save(discount);
      await ItemRepository.save(items.map((item) => ({
        ...item,
        discount_id: null,
      })));
    }
  }

  @AfterLoad()
  async getDiscount() {
    const DiscountRepository = global.datasource.getRepository('discounts');
    const discount = await DiscountRepository.createQueryBuilder()
      .where({
        id: this.discount_id,
      })
      .getOne();

    this.discount = discount as Discount;
  }

  @AfterLoad()
  async getOrdersForCustomerPayment() {
    if (this.type === 'customer-payment') {
      const OrderRepository = global.datasource.getRepository('orders');
      const orders = await OrderRepository.createQueryBuilder('order')
        .where(`order.transaction_id = :transactionId`)
        .setParameter('transactionId', `${this.id}`)
        .getMany();

      this.orders = orders as Order[];
    }
  }

  @AfterLoad()
  async getUser() {
    if (!this.creator) {
      const manager = global.datasource.createEntityManager();
      const rawData: any[] = await manager.query(
        `SELECT * FROM 'users' WHERE id = '${this.creator_id}'`
      );

      this.creator = rawData[0] as User;
    }
  }

  @AfterLoad()
  async getOrders() {
    if (this.type !== 'customer-payment') {
      const manager = global.datasource.createEntityManager();
      const rawData: any[] = await manager.query(
        `SELECT * FROM 'orders' WHERE transaction_id = '${this.id}'`
      );

      this.orders = rawData as Order[];
    }
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  system_id: string | null;

  @Column()
  creator_id: string;

  @Column({ nullable: true })
  discount_id: string;

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
    transaction.type === 'customer-payment' && transaction.amount_received < transaction.total
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
    Boolean(
      transaction.type === 'customer-payment' &&
      transaction.amount_received &&
      transaction.amount_received > transaction.total
    )
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
  total: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne('System', { eager: true })
  @JoinColumn({ name: 'system_id', referencedColumnName: 'id' })
  system: Relation<System>;

  @OneToOne('User', { eager: true })
  @JoinColumn({ name: 'creator_id', referencedColumnName: 'id' })
  creator: Relation<User>;

  @OneToOne('Discount', { eager: true })
  @JoinColumn({ name: 'discount_id', referencedColumnName: 'id' })
  discount: Relation<Discount>;

  @OneToMany('Order', (order: Order) => order.transaction, {
    eager: true,
  })
  @JoinColumn({ name: 'id', referencedColumnName: 'transaction_id' })
  orders: Relation<Order>[];
}
