import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class Orders1698705146069 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            generationStrategy: 'uuid',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'system_id',
            type: 'varchar',
          },
          {
            name: 'transaction_id',
            type: 'varchar',
            isNullable: false,
            foreignKeyConstraintName: 'transaction',
          },
          {
            name: 'item_id',
            type: 'varchar',
            isNullable: false,
            foreignKeyConstraintName: 'item',
          },
          {
            name: 'discount_id',
            type: 'varchar',
            isNullable: true,
            foreignKeyConstraintName: 'discount',
          },
          {
            name: 'quantity',
            type: 'real',
            isNullable: false,
          },
          {
            name: 'unit_of_measurement',
            type: 'string',
            isNullable: false,
          },
          {
            name: 'tax_rate',
            type: 'int',
            isNullable: true,
            default: 0
          },
          {
            name: 'price',
            type: 'real',
            isNullable: true,
            default: 0,
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
      'orders',
      new TableForeignKey({
        name: 'item',
        columnNames: ['item_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'items',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        name: 'transaction',
        columnNames: ['transaction_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'transactions',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        name: 'discount',
        columnNames: ['discount_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'discounts',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('orders', 'discount');
    await queryRunner.dropForeignKey('orders', 'item');
    await queryRunner.dropForeignKey('orders', 'transaction');
    await queryRunner.dropTable('orders');
  }
}
