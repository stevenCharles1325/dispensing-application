import { User } from 'Main/database/models/user.model';

export default interface AuditTrailDTO {
  id: string;
  system_id: number;
  user_id: number;

  resource_id: string;
  resource_id_type: 'uuid' | 'integer';
  resource_field: string;

  old_value: string;
  old_value_type: 'string' | 'number' | 'boolean' | 'object';

  new_value: string;
  new_value_type: 'string' | 'number' | 'boolean' | 'object';

  action: string;
  description: string;
  created_at: Date;

  related: any;
  user: User;
}
