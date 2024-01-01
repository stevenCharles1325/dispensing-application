import { Discount } from 'Main/database/models/discount.model';
import { SqliteDataSource } from 'Main/datasource';

const DiscountRepository = SqliteDataSource.getRepository(Discount);
export default DiscountRepository;
