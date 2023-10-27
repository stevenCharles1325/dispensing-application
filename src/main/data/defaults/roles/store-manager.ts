import RoleDTO from 'App/data-transfer-objects/role.dto';

const storeManager: Omit<RoleDTO, 'id'> = {
  name: 'Store Manager',
  kebab: 'store-manager',
};

export default storeManager;
