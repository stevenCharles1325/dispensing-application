import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { app } from 'electron';
import { User } from './database/models/user.model';
import { AuditTrail } from './database/models/audit-trail.model';
import { Brand } from './database/models/brand.model';
import { Category } from './database/models/category.model';
import { Image } from './database/models/image.model';
import { Item } from './database/models/item.model';
import { Order } from './database/models/order.model';
import { Permission } from './database/models/permission.model';
import { Role } from './database/models/role.model';
import { Supplier } from './database/models/supplier.model';
import { System } from './database/models/system.model';
import { Token } from './database/models/token.model';
import { Transaction } from './database/models/transaction.model';

const IS_PROD = process.env.NODE_ENV === 'production';
const PATH = IS_PROD ? app.getPath('userData') : __dirname;

const options: DataSourceOptions & SeederOptions = {
  type: 'sqlite',
  database: `${PATH}/database/db.sqlite`,
  entities: [
    AuditTrail,
    Brand,
    Category,
    Image,
    Item,
    Order,
    Permission,
    Role,
    Supplier,
    System,
    Token,
    Transaction,
    User,
  ],
  migrations: [
    `${app.getAppPath()}/dist/database/migrations/*`,
    `${__dirname}/database/migrations/*.ts`,
  ],
  seeds: [`${__dirname}/database/seeders/*.seeder.ts`],
  logging: true,
  synchronize: Boolean(process.env.SYNCHRONIZE) ?? false,
};

const sqliteDataSource = new DataSource(options);
export const SqliteDataSource = sqliteDataSource;
