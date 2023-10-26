import { User } from 'Main/database/models/user.model';

export default interface AuditTrailDTO {
  id: string;
  system_id?: number | null;
  user_id: number;

  resource_table?: string;
  resource_id?: string;
  resource_id_type?: 'uuid' | 'integer';

  action: string;
  status: 'SUCCEEDED' | 'FAILED';
  description: string;
  created_at: Date;

  related: any;
  user: User;
}
