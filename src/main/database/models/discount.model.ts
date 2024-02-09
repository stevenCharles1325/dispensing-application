import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  AfterLoad,
  Relation,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { User } from './user.model';
import type { Item } from './item.model';
import { MinLength, IsIn, IsPositive, ValidateIf } from 'class-validator';
import { ValidationMessage } from '../../app/validators/message/message';
import DiscountDTO from 'App/data-transfer-objects/discount.dto';
import Provider from '@IOC:Provider';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import UserDTO from 'App/data-transfer-objects/user.dto';

@Entity('discounts')
export class Discount {
  total_usage: number;
  items: any[];

  @AfterLoad()
  async getItemsRelated() {
    const ItemRepository = global.datasource.getRepository('items');
    const items = await ItemRepository.createQueryBuilder()
      .where({
        discount_id: this.id,
      })
      .getMany();

    this.items = items as Item[];
  }

  @AfterLoad()
  async getDiscountUsage() {
    const TransactionRepository = global.datasource.getRepository('transactions');
    const OrderRepository = global.datasource.getRepository('orders');

    const discountTransactionCount = await TransactionRepository.createQueryBuilder()
      .where({
        discount_id: this.id,
      })
      .getCount();

    const discountOrderCount = await OrderRepository.createQueryBuilder()
      .where({
        discount_id: this.id,
      })
      .getCount();

    this.total_usage = discountTransactionCount + discountOrderCount;
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
  system_id: string;

  @Column()
  creator_id: string;

  @Column({ nullable: false, unique: true })
  @MinLength(5, {
    message: ValidationMessage.minLength,
  })
  coupon_code: string;

  @Column({ nullable: false, unique: true })
  @MinLength(2, {
    message: ValidationMessage.minLength,
  })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: false })
  @IsIn([
    'percentage-off',
    'fixed-amount-off',
    'buy-one-get-one'
  ], {
    message: ValidationMessage.isIn,
  })
  discount_type: string;

  @Column('numeric', {
    nullable: false,
    precision: 7,
    scale: 2,
    transformer: {
      to: (data: number): number => data,
      from: (data: string): number => parseFloat(data),
    },
  })
  @ValidateIf((discount: DiscountDTO) =>
    discount.discount_type !== 'buy-one-get-one'
  )
  @IsPositive({
    message: ValidationMessage.positive,
  })
  discount_value: number;

  @Column({ nullable: true })
  @IsPositive({
    message: ValidationMessage.positive,
  })
  usage_limit: number;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @Column({ nullable: false })
  @IsIn([
    'active',
    'expired',
    'deactivated'
  ], {
    message: ValidationMessage.isIn,
  })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  @DeleteDateColumn()
  deleted_at: Date;

  @OneToOne('User', {
    eager: true,
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'creator_id', referencedColumnName: 'id' })
  creator: Relation<User>;
}
