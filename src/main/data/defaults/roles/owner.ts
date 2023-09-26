import RoleDTO from 'DTO/role.dto';
import permissions from '../permissions';

const owner: RoleDTO = {
  name: 'Owner',
  kebab: 'owner',
  permissions, // By default, all permissions are added to this role
};

export default owner;
