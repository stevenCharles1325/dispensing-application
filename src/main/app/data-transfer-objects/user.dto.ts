import RoleContract from './role.dto';

export default interface UserContract {
  first_name: string;

  last_name: string;

  birth_date: Date;

  phone_number: string;

  email: string;

  address: string;

  lead_id?: number;

  role_id?: number;

  role?: RoleContract;
}
