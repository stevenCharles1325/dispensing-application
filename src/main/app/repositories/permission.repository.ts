import { Permission } from 'Main/database/models/permission.model';
import { SqliteDataSource } from 'Main/datasource';

const PermissionRepository = SqliteDataSource.getRepository(Permission);
export default PermissionRepository;
