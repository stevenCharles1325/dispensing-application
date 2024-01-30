import {
  MigrationInterface,
  TableForeignKey,
  QueryRunner,
  Table,
} from 'typeorm';

export class Upload1704876174389 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'uploads',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            generationStrategy: 'uuid',
            isPrimary: true,
          },
          {
            name: 'uploader_id',
            type: 'varchar',
            isNullable: true,
            foreignKeyConstraintName: "uploader",
          },
          {
            name: 'file_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'total',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'success_count',
            type: 'int',
            isNullable: true,
            default: 0,
          },
          {
            name: 'error_count',
            type: 'int',
            isNullable: true,
            default: 0,
          },
          {
            name: 'status',
            type: 'varchar',
            enum: ['successful', 'failed'],
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
      'uploads',
      new TableForeignKey({
        name: 'uploader',
        columnNames: ['uploader_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('uploads', 'uploader');
    await queryRunner.dropTable('uploads');
  }
}
