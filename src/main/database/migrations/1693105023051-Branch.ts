import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class Branch1693105023051 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // This will only be tracked on the Main branch
    await queryRunner.createTable(
      new Table({
        name: 'branches',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            generationStrategy: 'uuid',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'store_name',
            comment: 'Store or Branch name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'store_manager_id',
            comment: 'Store manager or supervisor',
            type: 'int',
            isNullable: true,
            foreignKeyConstraintName: 'store_manager',
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
      'branches',
      new TableIndex({
        name: 'IDX_STORE_MANAGER',
        columnNames: ['id', 'store_manager_id'],
      })
    );

    await queryRunner.createForeignKey(
      'branches',
      new TableForeignKey({
        name: 'store_manager',
        columnNames: ['store_manager_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('branches', 'store_manager');
    await queryRunner.dropIndex('branches', 'IDX_STORE_MANAGER');
    await queryRunner.dropTable('branches');
  }
}
