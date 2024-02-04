import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { app } from 'electron';
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
import { User } from './database/models/user.model';
import { Notification } from './database/models/notification.model';
import { InventoryRecord } from './database/models/inventory-record.model';
import { ShortcutKey } from './database/models/shortcut-key.model';
import { Discount } from './database/models/discount.model';
import { Upload } from './database/models/upload.model';
import { UploadData } from './database/models/upload-data.model';
import MainSeeder from './database/seeders/main.seeder';
import { IS_PROD } from './main';

type DataSourceWithSeederOption = DataSourceOptions & SeederOptions;

export const DB_PATH = `${IS_PROD ? app.getPath('userData') : __dirname}/database/db.sqlite`;
const MIGRATION_PATH = `${IS_PROD ? `${app.getAppPath()}/dist` : __dirname}/database/migrations/*`;

export const options: DataSourceWithSeederOption = {
  type: 'sqlite',
  database: DB_PATH,
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
    Notification,
    InventoryRecord,
    ShortcutKey,
    Discount,
    Upload,
    UploadData,
  ],
  migrations: [
    MIGRATION_PATH,
  ],
  seeds: [
    MainSeeder,
  ],
  logging: true,
  synchronize: Boolean(process.env.SYNCHRONIZE) ?? true,
};

const sqliteDataSource = new DataSource(options);
export const SqliteDataSource = sqliteDataSource;
