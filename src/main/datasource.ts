import { DataSource } from 'typeorm';

/* eslint-disable import/prefer-default-export */
export const SqliteDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'src/main/database/db.sqlite',
  entities: [`src/main/models/*.ts`],
  logging: true,
  synchronize: Boolean(process.env.SYNCHRONIZE) ?? true,
  migrations: [`src/main/migrations/*.ts`],
});
