import { Brand } from 'Main/database/models/brand.model';
import { SqliteDataSource } from 'Main/datasource';

const BrandRepository = SqliteDataSource.getRepository(Brand);
export default BrandRepository;
