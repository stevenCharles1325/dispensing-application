import RoleDTO from './role.dto';

export default interface UserDTO {
  id: string;
  image_url: string;
  lead_id: string | null;
  system_id: string;
  role_id: string;
  notification_status?: 'on' | 'off';
  status?: 'active' | 'deactivated';
  first_name: string;
  last_name: string;
  birth_date: Date;
  phone_number: string;
  email: string;
  address: string;
  role: RoleDTO;
  lead?: UserDTO | null;
  password?: string;
  fullName(): string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  shortcut_keys?: [];
}
