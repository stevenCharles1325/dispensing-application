import { Token } from 'Main/database/models/token.model';
import { SqliteDataSource } from 'Main/datasource';

const TokenRepository = SqliteDataSource.getRepository(Token);
export default TokenRepository;
