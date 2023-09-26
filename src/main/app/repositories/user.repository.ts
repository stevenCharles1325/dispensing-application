import { User } from 'Main/database/models/user.model';
import { SqliteDataSource } from 'Main/datasource';

const UserRepository = SqliteDataSource.getRepository(User);
export default UserRepository;
