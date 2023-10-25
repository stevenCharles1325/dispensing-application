import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class AuditTrail1698132562574 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_trail',
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
            type: 'int',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
            foreignKeyConstraintName: 'user',
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: false,
            comment: 'Description of the action.',
          },
          {
            name: 'resource_table',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'resource_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'resource_id_type',
            type: 'varchar',
            enum: ['uuid', 'integer'],
            isNullable: false,
          },
          {
            name: 'resource_field',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'old_value',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'old_value_type',
            type: 'varchar',
            enum: ['string', 'number', 'boolean', 'object'],
            isNullable: false,
          },
          {
            name: 'new_value',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'new_value_type',
            type: 'varchar',
            enum: ['string', 'number', 'boolean', 'object'],
            isNullable: false,
          },
          {
            name: 'action',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      'audit_trail',
      new TableForeignKey({
        name: 'user',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('audit_trail', 'user');
    await queryRunner.dropTable('audit_trail');
  }
}
