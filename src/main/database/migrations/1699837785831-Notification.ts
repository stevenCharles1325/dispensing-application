import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class Notification1699837785831 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
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
            isNullable: true, // temporarily
          },
          {
            name: 'recipient_id',
            type: 'int',
            isNullable: true,
            foreignKeyConstraintName: 'recipient',
          },
          {
            name: 'sender_id',
            type: 'int',
            isNullable: true,
            foreignKeyConstraintName: 'sender',
          },
          {
            name: 'link',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'is_system_generated',
            type: 'boolean',
            default: false,
            isNullable: true,
          },
          {
            name: 'type',
            type: 'varchar',
            enum: ['NORMAL', 'SUCCESS', 'ERROR', 'WARNING'],
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            enum: ['SEEN', 'UNSEEN', 'VISITED'],
            default: "'UNSEEN'",
            isNullable: true,
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
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
      'notifications',
      new TableForeignKey({
        name: 'recipient',
        columnNames: ['recipient_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        name: 'sender',
        columnNames: ['sender_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('notifications', 'recipient');
    await queryRunner.dropForeignKey('notifications', 'sender');
    await queryRunner.dropTable('notifications');
  }
}
