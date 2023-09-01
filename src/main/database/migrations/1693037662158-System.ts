import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class System1693037662158 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'systems',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            generationStrategy: 'uuid',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'is_branch',
            type: 'boolean',
            isNullable: true,
            default: false,
          },
          {
            name: 'main_branch_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'store_name',
            comment: 'Store or Branch name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'branch_quantity',
            comment: 'This will be incremented if a new branch is added',
            type: 'int',
            unsigned: true,
            default: 0,
            isNullable: true,
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
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('systems');
  }
}
