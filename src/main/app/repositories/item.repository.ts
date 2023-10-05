import { Item } from 'Main/database/models/item.model';
import { SqliteDataSource } from 'Main/datasource';

const ItemRepository = SqliteDataSource.getRepository(Item);
export default ItemRepository;
