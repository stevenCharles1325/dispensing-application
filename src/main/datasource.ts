import { DataSource } from 'typeorm';

/* eslint-disable import/prefer-default-export */
export const SqliteDataSource = new DataSource({
  type: 'sqlite',
  database: `${__dirname}/database/db.sqlite`,
  entities: [`${__dirname}/models/*.ts`],
  logging: true,
  synchronize: Boolean(process.env.SYNCHRONIZE) ?? true,
  migrations: [`${__dirname}/migrations/*.ts`],
});
