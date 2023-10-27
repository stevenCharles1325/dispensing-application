import RoleDTO from 'App/data-transfer-objects/role.dto';

const administrator: Omit<RoleDTO, 'id'> = {
  name: 'Administrator',
  kebab: 'administrator',
};

export default administrator;
