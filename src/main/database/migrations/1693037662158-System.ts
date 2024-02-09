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
            name: 'is_main',
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
            name: 'phone_number',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'api_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'auto_sync',
            comment: 'Sync data from local to cloud database',
            type: 'boolean',
            isNullable: true,
            default: true,
          },
          {
            name: 'master_key',
            comment: 'The key from the application creator (This will also be the API key)',
            type: 'varchar',
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
