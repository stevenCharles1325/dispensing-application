import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey
} from 'typeorm';

export class InventoryRecord1701219766008 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(
        new Table({
          name: 'inventory_records',
          columns: [
            {
              name: 'id',
              type: 'integer',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'item_id',
              type: 'varchar',
              isPrimary: false,
              isUnique: false,
              isNullable: false,
              foreignKeyConstraintName: 'item',
            },
            {
              name: 'purpose',
              type: 'varchar',
              isNullable: false,
            },
            {
              name: 'note',
              type: 'varchar',
              isNullable: true,
            },
            {
              name: 'quantity',
              type: 'int',
              isNullable: false,
            },
            {
              name: 'type',
              type: 'varchar',
              isNullable: false,
              enum: ['stock-in', 'stock-out'],
              default: "'stock-in'"
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
        'inventory_records',
        new TableForeignKey({
          name: 'item',
          columnNames: ['item_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'items',
          onDelete: 'CASCADE',
        })
      );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropForeignKey('inventory_records', 'item');
      await queryRunner.dropTable('inventory_records');
    }
}
