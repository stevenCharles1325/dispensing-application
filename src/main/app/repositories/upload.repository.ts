import { Upload } from 'Main/database/models/upload.model';
import { SqliteDataSource } from 'Main/datasource';

const UploadRepository = SqliteDataSource.getRepository(Upload);
export default UploadRepository;
