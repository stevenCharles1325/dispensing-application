import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class Token1692522821716 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tokens',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            generationStrategy: 'uuid',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'user_id',
            type: 'varchar',
            isNullable: false,
            foreignKeyConstraintName: 'user',
          },
          {
            name: 'token',
            type: 'varchar(255)',
            isNullable: false,
          },
          {
            name: 'refresh_token',
            type: 'varchar(255)',
            isNullable: true,
          },
          {
            name: 'refresh_token_expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'token_expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      'tokens',
      new TableForeignKey({
        name: 'user',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('tokens', 'user');
    await queryRunner.dropTable('tokens');
  }
}
