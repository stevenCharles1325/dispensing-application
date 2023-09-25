import { System } from 'Main/database/models/system.model';
import { SqliteDataSource } from 'Main/datasource';

const SystemRepository = SqliteDataSource.getRepository(System);
export default SystemRepository;
