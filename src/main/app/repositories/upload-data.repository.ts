import { UploadData } from 'Main/database/models/upload-data.model';
import { SqliteDataSource } from 'Main/datasource';

const UploadDataRepository = SqliteDataSource.getRepository(UploadData);
export default UploadDataRepository;
