import RoleDTO from 'App/data-transfer-objects/role.dto';

const cashier: Omit<RoleDTO, 'id'> = {
  name: 'Cashier',
  kebab: 'cashier',
};

export default cashier;
