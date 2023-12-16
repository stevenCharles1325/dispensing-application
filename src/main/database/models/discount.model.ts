import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  AfterLoad,
  Relation,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { User } from './user.model';
import type { Item } from 'electron';
import { MinLength, IsIn, IsPositive } from 'class-validator';
import { ValidationMessage } from '../../app/validators/message/message';

@Entity('discounts')
export class Discount {
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

  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  system_id: number;

  @Column()
  creator_id: number;

  @Column({ nullable: false })
  @MinLength(5, {
    message: ValidationMessage.minLength,
  })
  coupon_code: string;

  @Column({ nullable: false })
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
