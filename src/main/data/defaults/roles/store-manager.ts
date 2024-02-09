import RoleDTO from 'App/data-transfer-objects/role.dto';

const storeManager: RoleDTO = {
  id: process.env.DEFAULT_STORE_MANAGER_ROLE_ID as string,
  name: 'Store Manager',
  kebab: 'store-manager',
};

export default storeManager;
