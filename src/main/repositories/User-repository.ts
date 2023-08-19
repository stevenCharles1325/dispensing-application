import { User } from 'Models/User';
import { SqliteDataSource } from 'Main/datasource';

const UserRepository = SqliteDataSource.getRepository(User);
export default UserRepository;
