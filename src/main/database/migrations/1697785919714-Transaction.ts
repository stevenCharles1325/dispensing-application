import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class Transaction1697785919714 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            generationStrategy: 'uuid',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'transaction_code',
            type: 'varchar',
          },
          {
            name: 'system_id',
            type: 'varchar',
          },
          {
            name: 'discount_id',
            type: 'varchar',
            isNullable: true,
            foreignKeyConstraintName: 'discount',
          },
          {
            name: 'creator_id',
            type: 'varchar',
            isNullable: false,
            foreignKeyConstraintName: 'creator',
          },
          {
            name: 'source_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'recipient_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'category',
            type: 'varchar',
            isNullable: false,
            enum: ['income', 'expense'],
            default: "'income'",
          },
          {
            name: 'type',
            type: 'varchar',
            isNullable: false,
            enum: [
              'customer-payment',
              'refund',
              'bill',
              'salary',
              'transfer',
              'restocking',
            ],
            default: "'customer-payment'",
          },
          {
            name: 'method',
            type: 'varchar',
            isNullable: false,
            enum: ['cash', 'card', 'e-wallet'],
            default: "'cash'",
          },
          {
            name: 'amount_received',
            type: 'real',
            isNullable: true,
          },
          {
            name: 'change',
            type: 'real',
            isNullable: true,
            default: 0,
          },
          {
            name: 'total',
            type: 'real',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        name: 'creator',
        columnNames: ['creator_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        name: 'system',
        columnNames: ['system_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'systems',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        name: 'discount',
        columnNames: ['discount_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'discounts',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('transactions', 'discount');
    await queryRunner.dropForeignKey('transactions', 'system');
    await queryRunner.dropForeignKey('transactions', 'creator');
    await queryRunner.dropTable('transactions');
  }
}
