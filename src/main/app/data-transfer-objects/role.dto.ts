import PermissionContract from './permission.dto';

export default interface RoleContract {
  name: string;
  kebab: string;
  permissions?: PermissionContract[] | undefined;
  description?: string | undefined;
}
