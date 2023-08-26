import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class System1693037662158 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'systems',
        columns: [
          {
            name: 'uuid',
            type: 'varchar',
            generationStrategy: 'uuid',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'branch_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'total_branch_quantity',
            type: 'int',
            unsigned: true,
            default: 0,
            isNullable: false,
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
