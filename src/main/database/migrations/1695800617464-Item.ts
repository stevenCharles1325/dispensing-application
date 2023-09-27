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
            name: 'sku',
            type: 'varchar',
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
            type: 'int',
            isNullable: false,
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
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
