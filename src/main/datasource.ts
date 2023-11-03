import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import AppRootDir from 'app-root-dir';
import { app } from 'electron';
import path from 'path';

const IS_PROD = process.env.NODE_ENV === 'production';
const PATH = IS_PROD ? app.getPath('userData') : __dirname;

const options: DataSourceOptions & SeederOptions = {
  type: 'sqlite',
  database: `${PATH}/database/db.sqlite`,
  entities: [
    path.join(AppRootDir.get(), `../../assets/database/models/*.model.ts`),
  ],
  migrations: [
    path.join(AppRootDir.get(), `../../assets/database/migrations/*.ts`),
  ],
  seeds: [
    path.join(AppRootDir.get(), `../../assets/database/seeders/*.seeder.ts`),
  ],
  synchronize: Boolean(process.env.SYNCHRONIZE) ?? false,
};

export const SqliteDataSource = new DataSource(options);
