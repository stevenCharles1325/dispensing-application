import { Image } from 'Main/database/models/image.model';
import { SqliteDataSource } from 'Main/datasource';

const ImageRepository = SqliteDataSource.getRepository(Image);
export default ImageRepository;
