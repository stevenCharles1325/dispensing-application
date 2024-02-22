import RoleDTO from 'App/data-transfer-objects/role.dto';

const cashier: RoleDTO = {
  id: process.env.DEFAULT_CASHIER_ROLE_ID as string,
  name: 'Cashier',
  kebab: 'cashier',
  permissions: [
    {
      name: 'View Brand',
      kebab: 'view-brand',
      group_name: 'brand',
    },
    {
      name: 'Create Brand',
      kebab: 'create-brand',
      group_name: 'brand',
    },
    {
      name: 'Update Brand',
      kebab: 'update-brand',
      group_name: 'brand',
    },
    {
      name: 'View Category',
      kebab: 'view-category',
      group_name: 'category',
    },
    {
      name: 'Create Category',
      kebab: 'create-category',
      group_name: 'category',
    },
    {
      name: 'Update Category',
      kebab: 'update-category',
      group_name: 'category',
    },
    {
      name: 'Download Data',
      kebab: 'download-data',
      group_name: 'data',
    },
    {
      name: 'View Notification',
      kebab: 'view-notification',
      group_name: 'notification',
    },
    {
      name: 'View Item',
      kebab: 'view-item',
      group_name: 'products',
    },
    {
      name: 'Create Item',
      kebab: 'create-item',
      group_name: 'products',
    },
    {
      name: 'Update Item',
      kebab: 'update-item',
      group_name: 'products',
    },
    {
      name: 'View Supplier',
      kebab: 'view-supplier',
      group_name: 'supplier',
    },
    {
      name: 'Create Supplier',
      kebab: 'create-supplier',
      group_name: 'supplier',
    },
    {
      name: 'Update Supplier',
      kebab: 'update-supplier',
      group_name: 'supplier',
    },
  ] as unknown as any[],
};

export default cashier;
