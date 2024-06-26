import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class User1692175684026 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            generationStrategy: 'uuid',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'lead_id',
            type: 'varchar',
            isNullable: true,
            foreignKeyConstraintName: 'lead',
          },
          {
            name: 'system_id',
            type: 'varchar',
          },
          {
            name: 'role_id',
            type: 'int',
            isNullable: true,
            foreignKeyConstraintName: 'role',
          },
          {
            name: 'image_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'notification_status',
            type: 'varchar',
            enum: ['on', 'off'],
            default: "'on'",
            isNullable: false,
          },
          {
            name: 'first_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'last_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'phone_number',
            type: 'varchar',
            isUnique: false,
            isNullable: false,
          },
          {
            name: 'birth_date',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            enum: ['active', 'deactivated'],
            default: "'active'",
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
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
      'users',
      new TableIndex({
        name: 'IDX_LEAD_USER',
        columnNames: ['id', 'lead_id'],
      })
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_ROLE_USER',
        columnNames: ['id', 'role_id'],
      })
    );

    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        name: 'lead',
        columnNames: ['lead_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        name: 'role',
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'users',
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
    await queryRunner.dropForeignKey('users', 'system');
    await queryRunner.dropForeignKey('users', 'lead');
    await queryRunner.dropForeignKey('users', 'role');
    await queryRunner.dropIndex('users', 'IDX_LEAD_USER');
    await queryRunner.dropIndex('users', 'IDX_ROLE_USER');
    await queryRunner.dropTable('users');
  }
}
