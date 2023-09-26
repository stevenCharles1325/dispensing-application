import permissions from '../permissions';
import RoleDTO from 'App/data-transfer-objects/role.dto';

const owner: RoleDTO = {
  name: 'Owner',
  kebab: 'owner',
  permissions: permissions as unknown as any, // By default, all permissions are added to this role
};

export default owner;
