import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class Discount1702610770719 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'discounts',
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
            name: 'creator_id',
            type: 'varchar',
            foreignKeyConstraintName: 'creator',
          },
          {
            name: 'coupon_code',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'discount_type',
            type: 'varchar',
            isNullable: false,
            enum: [
              'percentage-off',
              'fixed-amount-off',
              'buy-one-get-one'
            ],
            default: "'percentage-off'",
          },
          {
            name: 'discount_value',
            type: 'real',
            isNullable: true,
            default: 0,
          },
          {
            name: 'usage_limit',
            type: 'int',
            isNullable: true,
            default: 10,
          },
          {
            name: 'start_date',
            type: 'datetime',
            default: 'now()',
          },
          {
            name: 'end_date',
            type: 'datetime',
            default: 'now()',
          },
          {
            name: 'status',
            type: 'varchar',
            isNullable: false,
            enum: [
              'active',
              'expired',
              'deactivated'
            ],
            default: "'active'",
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
      'discounts',
      new TableForeignKey({
        name: 'creator',
        columnNames: ['creator_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('discounts', 'creator');
    await queryRunner.dropTable('discounts');
  }
}
