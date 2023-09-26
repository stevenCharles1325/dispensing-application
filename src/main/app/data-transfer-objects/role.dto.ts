import PermissionDTO from './permission.dto';

export default interface RoleDTO {
  name: string;
  kebab: string;
  permissions?: PermissionDTO[] | undefined;
  description?: string | undefined;
}
