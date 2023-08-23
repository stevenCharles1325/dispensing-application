import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

const options: DataSourceOptions & SeederOptions = {
  type: 'sqlite',
  database: `${__dirname}/database/db.sqlite`,
  entities: [`${__dirname}/database/models/*.ts`],
  migrations: [`${__dirname}/database/migrations/*.ts`],
  seeds: [`${__dirname}/database/seeders/*.ts`],
  logging: true,
  synchronize: Boolean(process.env.SYNCHRONIZE) ?? true,
};

export const SqliteDataSource = new DataSource(options);
