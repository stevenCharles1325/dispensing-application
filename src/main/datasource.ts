import { DataSource } from 'typeorm';

/* eslint-disable import/prefer-default-export */
export const SqliteDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  entities: [`models/*.ts`],
  logging: true,
  synchronize: Boolean(process.env.SYNCHRONIZE) ?? true,
  migrations: [`migrations/*.ts`],
});
