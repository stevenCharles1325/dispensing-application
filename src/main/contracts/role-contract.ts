import PermissionContract from './permission-contract';

export default interface RoleContract {
  name: string;
  kebab: string;
  permissions?: PermissionContract[] | undefined;
  description?: string | undefined;
}
