import RoleContract from 'Contracts/role';
import permissions from '../permissions';

const owner: RoleContract = {
  name: 'Owner',
  kebab: 'owner',
  permissions, // By default, all permissions are added to this role
};

export default owner;
