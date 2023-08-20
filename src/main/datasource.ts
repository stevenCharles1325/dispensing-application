import { DataSource } from 'typeorm';

/* eslint-disable import/prefer-default-export */
export const SqliteDataSource = new DataSource({
  type: 'sqlite',
  database: `${__dirname}/database/db.sqlite`,
  entities: [`${__dirname}/database/models/*.ts`],
  migrations: [`${__dirname}/database/migrations/*.ts`],
  logging: true,
  synchronize: Boolean(process.env.SYNCHRONIZE) ?? true,
});
