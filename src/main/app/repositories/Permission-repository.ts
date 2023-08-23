import { Permission } from 'Main/database/models/Permission';
import { SqliteDataSource } from 'Main/datasource';

const PermissionRepository = SqliteDataSource.getRepository(Permission);
export default PermissionRepository;
