import { UploadChunk } from 'Main/database/models/upload-chunk.model';
import { SqliteDataSource } from 'Main/datasource';

const UploadChunkRepository = SqliteDataSource.getRepository(UploadChunk);
export default UploadChunkRepository;
