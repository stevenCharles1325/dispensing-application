import { Order } from 'Main/database/models/order.model';
import { SqliteDataSource } from 'Main/datasource';

const OrderRepository = SqliteDataSource.getRepository(Order);
export default OrderRepository;
