import { InventoryRecord } from 'Main/database/models/inventory-record.model';
import { SqliteDataSource } from 'Main/datasource';

const InventoryRecordRepository = SqliteDataSource.getRepository(InventoryRecord);
export default InventoryRecordRepository;
