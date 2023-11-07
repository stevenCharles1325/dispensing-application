import { DataSource } from 'typeorm';

declare global {
  var datasource: DataSource;
}

export {}
