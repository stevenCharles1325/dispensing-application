import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class Supplier1696655002476 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'suppliers',
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
            isNullable: false,
          },
          {
            name: 'image_id',
            type: 'int',
            isNullable: true,
            comment: 'Logo',
            foreignKeyConstraintName: 'image',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'phone_number',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'contact_name',
            type: 'varchar',
            isNullable: false,
            comment: `The name of a specific contact person at the supplier's organization.`,
          },
          {
            name: 'contact_email',
            type: 'varchar',
            isNullable: false,
            comment: 'The email address of the contact person.',
          },
          {
            name: 'contact_phone_number',
            type: 'varchar',
            isNullable: false,
            comment: 'The phone number of the contact person.',
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: false,
            comment: 'The phone number of the contact person.',
          },
          {
            name: 'tax_id',
            type: 'varchar',
            isNullable: false,
            comment:
              'The tax identification number or VAT (Value Added Tax) number for the supplier, which may be necessary for tax reporting purposes.',
          },
          {
            name: 'status',
            type: 'varchar',
            isNullable: false,
            enum: ['active', 'inactive', 'deactivated'],
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

    await queryRunner.createIndex(
      'suppliers',
      new TableIndex({
        name: 'IDX_SUPPLIER_IMAGE',
        columnNames: ['id', 'image_id', 'supplier_id'],
      })
    );

    await queryRunner.createForeignKey(
      'suppliers',
      new TableForeignKey({
        name: 'image',
        columnNames: ['image_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'images',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'suppliers',
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
    await queryRunner.dropForeignKey('suppliers', 'system');
    await queryRunner.dropForeignKey('suppliers', 'image');
    await queryRunner.dropIndex('suppliers', 'IDX_SUPPLIER_IMAGE');
    await queryRunner.dropTable('suppliers');
  }
}
