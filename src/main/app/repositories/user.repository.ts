import { User } from 'Main/database/models/User';
import { SqliteDataSource } from 'Main/datasource';

const UserRepository = SqliteDataSource.getRepository(User);
export default UserRepository;
