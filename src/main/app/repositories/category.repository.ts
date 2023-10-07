import { Category } from 'Main/database/models/category.model';
import { SqliteDataSource } from 'Main/datasource';

const CategoryRepository = SqliteDataSource.getRepository(Category);
export default CategoryRepository;
