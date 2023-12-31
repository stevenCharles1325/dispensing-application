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
        name: 'audit_trails',
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
            isNullable: true,
          },
          {
            name: 'resource_id_type',
            type: 'varchar',
            enum: ['uuid', 'integer'],
            default: "'uuid'",
            isNullable: true,
          },
          {
            name: 'action',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            enum: ['SUCCEEDED', 'FAILED'],
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
      'audit_trails',
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
    await queryRunner.dropForeignKey('audit_trails', 'user');
    await queryRunner.dropTable('audit_trails');
  }
}
