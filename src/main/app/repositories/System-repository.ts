import { System } from 'Main/database/models/System';
import { SqliteDataSource } from 'Main/datasource';

const SystemRepository = SqliteDataSource.getRepository(System);
export default SystemRepository;
