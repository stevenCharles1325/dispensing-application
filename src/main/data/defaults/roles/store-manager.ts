import RoleDTO from 'App/data-transfer-objects/role.dto';

const storeManager: RoleDTO = {
  id: process.env.DEFAULT_STORE_MANAGER_ROLE_ID as string,
  name: 'Store Manager',
  kebab: 'store-manager',
  permissions: [
    // Audit-Trail permissions
    {
      name: 'View Audit Trail',
      kebab: 'view-audit-trail',
      group_name: 'audit-trail',
    },

    // Report permissions
    {
      name: 'View Report',
      kebab: 'view-report',
      group_name: 'report',
    },

    // User/Employee management permissions
    {
      name: 'View User',
      kebab: 'view-user',
      group_name: 'account',
    },
    {
      name: 'Create User',
      kebab: 'create-user',
      group_name: 'account',
    },
    {
      name: 'Update User',
      kebab: 'update-user',
      group_name: 'account',
    },
    {
      name: 'Delete User',
      kebab: 'delete-user',
      group_name: 'account',
    },

    // Inventory management permissions
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
      name: 'Delete Item',
      kebab: 'delete-item',
      group_name: 'products',
    },

    // Inventory-record permissions
    {
      name: 'View Stock Record',
      kebab: 'view-stock-record',
      group_name: 'stocks',
    },
    {
      name: 'Create Stock Record',
      kebab: 'create-stock-record',
      group_name: 'stocks',
    },

    // Category management permissions
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
      name: 'Delete Category',
      kebab: 'delete-category',
      group_name: 'category',
    },

    // Brand management permissions
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
      name: 'Delete Brand',
      kebab: 'delete-brand',
      group_name: 'brand',
    },

    // Supplier management permissions
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
    {
      name: 'Delete Supplier',
      kebab: 'delete-supplier',
      group_name: 'supplier',
    },

    // Image management permissions
    {
      name: 'View Image',
      kebab: 'view-image',
      group_name: 'image',
    },
    {
      name: 'Create Image',
      kebab: 'create-image',
      group_name: 'image',
    },
    {
      name: 'Update Image',
      kebab: 'update-image',
      group_name: 'image',
    },
    {
      name: 'Delete Image',
      kebab: 'delete-image',
      group_name: 'image',
    },

    // Transaction management permissions
    {
      name: 'View Transaction',
      kebab: 'view-transaction',
      group_name: 'transaction',
    },
    {
      name: 'Create Transaction',
      kebab: 'create-transaction',
      group_name: 'transaction',
    },

    // Notification permissions
    {
      name: 'View Notification',
      kebab: 'view-notification',
      group_name: 'notification',
    },

    // Settings permissions
    {
      name: 'View Settings',
      kebab: 'view-settings',
      group_name: 'settings',
    },
    {
      name: 'Update Settings',
      kebab: 'update-settings',
      group_name: 'settings',
    },

    // Data
    {
      name: 'Download Data',
      kebab: 'download-data',
      group_name: 'data',
    },
    {
      name: 'Upload Data',
      kebab: 'upload-data',
      group_name: 'data',
    },
  ] as unknown as any[],
};

export default storeManager;
