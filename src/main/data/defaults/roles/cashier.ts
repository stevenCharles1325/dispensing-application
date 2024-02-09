import RoleDTO from 'App/data-transfer-objects/role.dto';

const cashier: RoleDTO = {
  id: process.env.DEFAULT_CASHIER_ROLE_ID as string,
  name: 'Cashier',
  kebab: 'cashier',
};

export default cashier;
