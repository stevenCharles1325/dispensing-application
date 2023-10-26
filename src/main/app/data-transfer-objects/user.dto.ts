import RoleDTO from './role.dto';

export default interface UserDTO {
  id: number;
  lead_id: number | null;
  system_id: number;
  role_id: number;
  first_name: string;
  last_name: string;
  birth_date: Date;
  phone_number: string;
  email: string;
  address: string;
  role: RoleDTO;
  lead?: UserDTO | null;
  fullName(): string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
