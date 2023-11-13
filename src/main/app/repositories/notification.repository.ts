import { Notification } from 'Main/database/models/notification.model';
import { SqliteDataSource } from 'Main/datasource';

const NotificationRepository = SqliteDataSource.getRepository(Notification);
export default NotificationRepository;
