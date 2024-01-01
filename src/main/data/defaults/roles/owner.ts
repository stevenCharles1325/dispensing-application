import permissions from '../permissions';
import RoleDTO from 'App/data-transfer-objects/role.dto';

const owner: RoleDTO = {
  id: '147fed09-c5a8-4ad0-8fc8-0d9776883d40',
  name: 'Owner',
  kebab: 'owner',
  permissions: permissions as unknown as any, // By default, all permissions are added to this role
};

export default owner;
