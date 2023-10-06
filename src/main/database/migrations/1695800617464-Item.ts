import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class Item1695800617464 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'items',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            generationStrategy: 'uuid',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'image_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'category_id',
            type: 'int',
            isNullable: false,
            foreignKeyConstraintName: 'category',
          },
          {
            name: 'brand_id',
            type: 'int',
            isNullable: false,
            foreignKeyConstraintName: 'brand',
          },
          {
            name: 'supplier_id',
            type: 'int',
            isNullable: false,
            foreignKeyConstraintName: 'supplier',
          },
          {
            name: 'sku',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
            comment: 'Item ID or SKU (Stock Keeping Unit).',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'cost_price',
            type: 'int',
            isNullable: false,
            default: 0,
            comment: 'The cost of acquiring the item from the supplier.',
          },
          {
            name: 'selling_price',
            type: 'int',
            isNullable: false,
            default: 0,
            comment: 'The price at which the item is sold to customers.',
          },
          {
            name: 'tax_rate',
            type: 'int',
            isNullable: false,
            comment: 'The price at which the item is sold to customers.',
          },
          {
            name: 'unit_of_measurement',
            type: 'varchar',
            isNullable: false,
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
            ],
            default: "'each'",
            comment:
              'The unit in which the item is measured or sold (e.g., each, dozen, pound, liter).',
          },
          {
            name: 'barcode',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'stock_quantity',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            isNullable: false,
            enum: [
              'available', // Can be purchased
              'on-hold', // Might be having quality control
              'out-of-stock', // Not available for the meantime
              'discontinued', // Will not be selling for any reason
              'awaiting-shipment', // Has been ordered but is waiting to be delivered
            ],
            default: "'available'",
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
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('items');
  }
}
