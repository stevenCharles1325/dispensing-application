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
  AfterInsert,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import type { Transaction } from './transaction.model';
import type { Item } from './item.model';
import type { Discount } from './discount.model';

@Entity('orders')
export class Order {
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
  async getItems() {
    const ItemRepository = global.datasource.getRepository('items');
    const item = await ItemRepository.findOneByOrFail({ id: this.item_id });

    this.item = item as Item;
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

  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  system_id: number;

  @Column()
  item_id: string;

  @Column()
  discount_id: number;

  @Column()
  transaction_id: number;

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
