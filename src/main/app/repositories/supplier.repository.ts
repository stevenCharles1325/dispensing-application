import { Supplier } from 'Main/database/models/supplier.model';
import { SqliteDataSource } from 'Main/datasource';

const SupplierRepository = SqliteDataSource.getRepository(Supplier);
export default SupplierRepository;
