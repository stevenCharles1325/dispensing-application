import { Transaction } from 'Main/database/models/transaction.model';
import { SqliteDataSource } from 'Main/datasource';

const TransactionRepository = SqliteDataSource.getRepository(Transaction);
export default TransactionRepository;
