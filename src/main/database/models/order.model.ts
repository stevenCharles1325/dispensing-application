/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-destructuring */
/* eslint-disable import/prefer-default-export */
import {
  OneToOne,
  ManyToOne,
  JoinColumn,
  Column,
  Entity,
  CreateDateColumn,
  AfterLoad,
  PrimaryGeneratedColumn,
  Relation,
  AfterInsert,
} from 'typeorm';
import type { Transaction } from './transaction.model';
import type { Item } from './item.model';
import type { Discount } from './discount.model';
import { Bull } from 'Main/jobs';
import Provider from '@IOC:Provider';
import UserDTO from 'App/data-transfer-objects/user.dto';
import IAuthService from 'App/interfaces/service/service.auth.interface';

@Entity('orders')
export class Order {
  @AfterInsert()
  async discountTotalUsageListener() {
    const DiscountRepository = global.datasource.getRepository('discounts');
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
          title: `A discount has reached usage limit`,
          description: `A discount named ${discount.title} has reached usage limit.`,
          link: null,
          is_system_generated: true,
          status: 'UNSEEN',
          type: 'ERROR',
        }
      );

      await DiscountRepository.save(discount);
    }
  }

  @AfterLoad()
  async getItems() {
    const ItemRepository = global.datasource.getRepository('items');
    const item = await ItemRepository.findOneByOrFail({ id: this.item_id });

    this.item = item as Item;
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

  @AfterInsert()
  async updatePurchasedItem() {
    const ItemRepository = global.datasource.getRepository('items');
    const item = await ItemRepository.findOneByOrFail({
      id: this.item_id as unknown as string,
    });

    item.purchase(this.quantity);
    await ItemRepository.save(item);
  }

  @AfterInsert()
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
  item_id: string;

  @Column()
  discount_id: string;

  @Column()
  transaction_id: string;

  @Column()
  quantity: number;

  @Column()
  tax_rate: number;

  @Column()
  price: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne('Item', { eager: true })
  @JoinColumn({ name: 'item_id', referencedColumnName: 'id' })
  item: Relation<Item>;

  @ManyToOne('Transaction', (transaction: Transaction) => transaction.orders)
  @JoinColumn({ name: 'transaction_id', referencedColumnName: 'id' })
  transaction: Relation<Transaction>;

  @OneToOne('Discount', { eager: true })
  @JoinColumn({ name: 'discount_id', referencedColumnName: 'id' })
  discount: Relation<Discount>;
}
