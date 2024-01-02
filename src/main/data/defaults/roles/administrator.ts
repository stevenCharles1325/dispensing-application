import RoleDTO from 'App/data-transfer-objects/role.dto';

const administrator: RoleDTO = {
  id: process.env.DEFAULT_ADMIN_ROLE_ID as string,
  name: 'Administrator',
  kebab: 'administrator',
};

export default administrator;
