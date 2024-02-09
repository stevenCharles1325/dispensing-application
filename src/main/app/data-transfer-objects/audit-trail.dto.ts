import { User } from 'Main/database/models/user.model';

export default interface AuditTrailDTO {
  id: string;
  system_id?: string | null;
  user_id: string;

  resource_table?: string;
  resource_id?: string;
  resource_id_type?: 'uuid';

  action: string;
  status: 'SUCCEEDED' | 'FAILED';
  description: string;
  created_at: Date;

  related: any;
  user: User;
}
