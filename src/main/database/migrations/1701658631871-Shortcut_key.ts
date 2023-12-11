import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class ShortcutKey1701658631871 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'shortcut_keys',
        columns: [
          {
            name: 'id',
            type: 'integer',
            generationStrategy: 'increment',
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
            name: 'key',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'key_combination',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
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

    await queryRunner.createForeignKey(
      'shortcut_keys',
      new TableForeignKey({
        name: 'user',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('shortcut_keys', 'user');
    await queryRunner.dropTable('shortcut_keys');
  }
}
