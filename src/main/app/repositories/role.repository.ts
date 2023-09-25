import { Role } from 'Main/database/models/role.model';
import { SqliteDataSource } from 'Main/datasource';

const RoleRepository = SqliteDataSource.getRepository(Role);
export default RoleRepository;
