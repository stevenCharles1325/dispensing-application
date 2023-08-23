import { Role } from 'Main/database/models/Role';
import { SqliteDataSource } from 'Main/datasource';

const RoleRepository = SqliteDataSource.getRepository(Role);
export default RoleRepository;
