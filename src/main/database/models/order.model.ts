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
} from 'typeorm';
import { Item } from './item.model';
import { Transaction } from './transaction.model';
import { SqliteDataSource } from 'Main/datasource';
import ItemRepository from 'App/repositories/item.repository';

@Entity('orders')
export class Order {
  @AfterLoad()
  async getItems() {
    const item = await ItemRepository.findOneByOrFail({ id: this.item_id });

    this.item = item;
  }

  @AfterInsert()
  async updatePurchasedItem() {
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
  transaction_id: number;

  @Column()
  quantity: number;

  @Column()
  tax_rate: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne(() => Item, { eager: true })
  @JoinColumn({ name: 'item_id', referencedColumnName: 'id' })
  item: Item;

  @ManyToOne(() => Transaction, (transaction) => transaction.orders)
  @JoinColumn({ name: 'transaction_id', referencedColumnName: 'id' })
  transaction: Transaction;
}
