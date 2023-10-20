import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class Transaction1697785919714 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'integer',
            generationStrategy: 'increment',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'system_id',
            type: 'int',
            isNullable: true, // temporarily
          },
          {
            name: 'creator_id',
            type: 'integer',
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
            name: 'total',
            type: 'real',
            isNullable: false,
          },
          {
            name: 'item_details',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('transactions', 'system');
    await queryRunner.dropForeignKey('transactions', 'creator');
    await queryRunner.dropTable('transactions');
  }
}
