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
              type: 'varchar',
              generationStrategy: 'uuid',
              isPrimary: true,
              isGenerated: true,
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
              name: 'creator_id',
              type: 'varchar',
              isPrimary: false,
              isUnique: false,
              isNullable: false,
              foreignKeyConstraintName: 'creator',
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
              type: 'real',
              isNullable: false,
            },
            {
              name: 'unit_of_measurement',
              type: 'varchar',
              enum: [
                // Length/Dimension
                'millimeters',
                'centimeters',
                'meters',
                'feet',
                'yards',

                // Weight/Mass
                'milligrams',
                'grams',
                'kilograms',
                'ounces',
                'pounds',

                // Volume/Capacity
                'milliliters',
                'liters',
                'cubic-centimeters',
                'cubic-meters',
                'fluid-ounces',
                'gallons',

                // Area
                'square-millimeters',
                'square-centimeters',
                'square-meters',
                'square-inches',
                'square-feet',
                'square-yards',

                // Count/Quantity
                'each',
                'dozen',
                'gross',
                'pack',
                'pair',
                'pieces',
                'set',
              ],
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

      await queryRunner.createForeignKey(
        'inventory_records',
        new TableForeignKey({
          name: 'creator',
          columnNames: ['creator_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'CASCADE',
        })
      );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropForeignKey('inventory_records', 'creator');
      await queryRunner.dropForeignKey('inventory_records', 'item');
      await queryRunner.dropTable('inventory_records');
    }
}
