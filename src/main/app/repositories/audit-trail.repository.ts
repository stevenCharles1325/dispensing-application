import { AuditTrail } from 'Main/database/models/audit-trail.model';
import { SqliteDataSource } from 'Main/datasource';

const AuditTrailRepository = SqliteDataSource.getRepository(AuditTrail);
export default AuditTrailRepository;
