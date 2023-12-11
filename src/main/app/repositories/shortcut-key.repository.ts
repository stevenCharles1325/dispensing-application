import { ShortcutKey } from 'Main/database/models/shortcut-key.model';
import { SqliteDataSource } from 'Main/datasource';

const ShortcutKeyRepository = SqliteDataSource.getRepository(ShortcutKey);
export default ShortcutKeyRepository;
