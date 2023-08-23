import { Token } from 'Main/database/models/Token';
import { SqliteDataSource } from 'Main/datasource';

const TokenRepository = SqliteDataSource.getRepository(Token);
export default TokenRepository;
