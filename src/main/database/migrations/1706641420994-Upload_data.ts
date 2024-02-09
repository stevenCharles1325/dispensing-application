import {
  MigrationInterface,
  TableForeignKey,
  QueryRunner,
  Table,
} from 'typeorm';

export class UploadData1706641420994 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'upload_datas',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            generationStrategy: 'uuid',
            isPrimary: true,
          },
          {
            name: 'upload_id',
            type: 'varchar',
            isNullable: true,
            foreignKeyConstraintName: "upload",
          },
          {
            name: 'content',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            enum: ['success', 'error'],
            default: "'success'",
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
      'upload_datas',
      new TableForeignKey({
        name: 'upload',
        columnNames: ['upload_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'uploads',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('upload_datas', 'upload');
    await queryRunner.dropTable('upload_datas');
  }
}
