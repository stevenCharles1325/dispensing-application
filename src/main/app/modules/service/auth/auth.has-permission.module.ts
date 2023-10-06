import UserDTO from 'App/data-transfer-objects/user.dto';
import { PermissionsKebabType } from 'Main/data/defaults/permissions';

export default function hasPermission(
  this: any,
  user: UserDTO,
  ...permission: PermissionsKebabType[]
): boolean {
  return user.role.permissions!.some(({ kebab }) =>
    permission.includes(kebab as PermissionsKebabType)
  );
}
