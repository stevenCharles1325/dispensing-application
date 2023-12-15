/* eslint-disable prettier/prettier */

const permissions = [
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

  // Role management permissions
  {
    name: 'View Role',
    kebab: 'view-role',
    group_name: 'role',
  },
  {
    name: 'Create Role',
    kebab: 'create-role',
    group_name: 'role',
  },
  {
    name: 'Update Role',
    kebab: 'update-role',
    group_name: 'role',
  },
  // {
  //   name: 'Archive Role',
  //   kebab: 'archive-role',
  //   group_name: 'role',
  // },
  {
    name: 'Delete Role',
    kebab: 'delete-role',
    group_name: 'role',
  },

  // Permission management permissions
  {
    name: 'View Permission',
    kebab: 'view-permission',
    group_name: 'permission',
  },
  // {
  //   name: 'Create Permission',
  //   kebab: 'create-permission',
  //   group_name: 'permission',
  // },
  // {
  //   name: 'Update Permission',
  //   kebab: 'update-permission',
  //   group_name: 'permission',
  // },
  // {
  //   name: 'Archive Permission',
  //   kebab: 'archive-permission',
  //   group_name: 'permission',
  // },
  // {
  //   name: 'Delete Permission',
  //   kebab: 'delete-permission',
  //   group_name: 'permission',
  // },

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
  // {
  //   name: 'Archive User',
  //   kebab: 'archive-user',
  //   group_name: 'account',
  // },
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
  // {
  //   name: 'Archive Item',
  //   kebab: 'archive-item',
  //   group_name: 'products',
  // },
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
  // {
  //   name: 'Archive Item',
  //   kebab: 'archive-item',
  //   group_name: 'products',
  // },

  // Discount management permissions
  {
    name: 'View Discount',
    kebab: 'view-discount',
    group_name: 'products',
  },
  {
    name: 'Create Discount',
    kebab: 'create-discount',
    group_name: 'products',
  },
  {
    name: 'Update Discount',
    kebab: 'update-discount',
    group_name: 'products',
  },
  // {
  //   name: 'Archive Item',
  //   kebab: 'archive-item',
  //   group_name: 'products',
  // },
  {
    name: 'Delete Discount',
    kebab: 'delete-discount',
    group_name: 'products',
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
  // {
  //   name: 'Archive Category',
  //   kebab: 'archive-category',
  //   group_name: 'category',
  // },
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
  // {
  //   name: 'Archive Brand',
  //   kebab: 'archive-brand',
  //   group_name: 'brand',
  // },
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
  // {
  //   name: 'Archive Supplier',
  //   kebab: 'archive-supplier',
  //   group_name: 'supplier',
  // },
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
  // {
  //   name: 'Archive Image',
  //   kebab: 'archive-image',
  //   group_name: 'image',
  // },
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
  // {
  //   name: 'Update Transaction',
  //   kebab: 'update-transaction',
  //   group_name: 'transaction',
  // },
  // {
  //   name: 'Archive Transaction',
  //   kebab: 'archive-transaction',
  //   group_name: 'transaction',
  // },
  // {
  //   name: 'Delete Transaction',
  //   kebab: 'delete-transaction',
  //   group_name: 'transaction',
  // },

  // Attendance management permissions
  // {
  //   name: 'View Attendance',
  //   kebab: 'view-attendance',
  //   group_name: 'attendance',
  // },
  // {
  //   name: 'Create Attendance',
  //   kebab: 'create-attendance',
  //   group_name: 'attendance',
  // },
  // {
  //   name: 'Update Attendance',
  //   kebab: 'update-attendance',
  //   group_name: 'attendance',
  // },
  // {
  //   name: 'Archive Attendance',
  //   kebab: 'archive-attendance',
  //   group_name: 'attendance',
  // },
  // {
  //   name: 'Delete Attendance',
  //   kebab: 'delete-attendance',
  //   group_name: 'attendance',
  // },

  // Transaction management permissions
  // Customer Payment permissions
  {
    name: 'View Customer Payment',
    kebab: 'view-customer-payment',
    group_name: 'transaction',
  },
  {
    name: 'Create Customer Payment',
    kebab: 'create-customer-payment',
    group_name: 'transaction',
  },
  // {
  //   name: 'Update Customer Payment',
  //   kebab: 'update-customer-payment',
  //   group_name: 'transaction',
  // },
  // {
  //   name: 'Archive Customer Payment',
  //   kebab: 'archive-customer-payment',
  //   group_name: 'transaction',
  // },
  // {
  //   name: 'Delete Customer Payment',
  //   kebab: 'delete-customer-payment',
  //   group_name: 'transaction',
  // },
  // // Refund permissions
  // {
  //   name: 'View Refund',
  //   kebab: 'view-refund',
  //   group_name: 'transaction',
  // },
  // {
  //   name: 'Create Refund',
  //   kebab: 'create-refund',
  //   group_name: 'transaction',
  // },
  // {
  //   name: 'Update Refund',
  //   kebab: 'update-refund',
  //   group_name: 'transaction',
  // },
  // {
  //   name: 'Archive Refund',
  //   kebab: 'archive-refund',
  //   group_name: 'transaction',
  // },
  // {
  //   name: 'Delete Refund',
  //   kebab: 'delete-refund',
  //   group_name: 'transaction',
  // },
  // // Bill permissions
  // {
  //   name: 'View Bill',
  //   kebab: 'view-bill',
  //   group_name: 'transaction',
  // },
  // {
  //   name: 'Create Bill',
  //   kebab: 'create-bill',
  //   group_name: 'transaction',
  // },
  // {
  //   name: 'Update Bill',
  //   kebab: 'update-bill',
  //   group_name: 'transaction',
  // },
  // {
  //   name: 'Archive Bill',
  //   kebab: 'archive-bill',
  //   group_name: 'transaction',
  // },
  // {
  //   name: 'Delete Bill',
  //   kebab: 'delete-bill',
  //   group_name: 'transaction',
  // },
  // // Salary permissions
  // {
  //   name: 'View Salary',
  //   kebab: 'view-salary',
  //   group_name: 'salary',
  // },
  // {
  //   name: 'Create Salary',
  //   kebab: 'create-salary',
  //   group_name: 'salary',
  // },
  // {
  //   name: 'Update Salary',
  //   kebab: 'update-salary',
  //   group_name: 'salary',
  // },
  // {
  //   name: 'Archive Salary',
  //   kebab: 'archive-salary',
  //   group_name: 'salary',
  // },
  // {
  //   name: 'Delete Salary',
  //   kebab: 'delete-salary',
  //   group_name: 'salary',
  // },
  // Restocking permissions
  // {
  //   name: 'View Restocking',
  //   kebab: 'view-restocking',
  //   group_name: 'restocking',
  // },
  // {
  //   name: 'Create Restocking',
  //   kebab: 'create-restocking',
  //   group_name: 'restocking',
  // },
  // {
  //   name: 'Update Restocking',
  //   kebab: 'update-restocking',
  //   group_name: 'restocking',
  // },
  // {
  //   name: 'Archive Restocking',
  //   kebab: 'archive-restocking',
  //   group_name: 'restocking',
  // },
  // {
  //   name: 'Delete Restocking',
  //   kebab: 'delete-restocking',
  //   group_name: 'restocking',
  // },

   // Notification permissions
   {
    name: 'View Notification',
    kebab: 'view-notification',
    group_name: 'notification',
  },
  {
    name: 'Create Notification',
    kebab: 'create-notification',
    group_name: 'notification',
  },
  {
    name: 'Update Notification',
    kebab: 'update-notification',
    group_name: 'notification',
  },
  // {
  //   name: 'Archive Notification',
  //   kebab: 'archive-notification',
  //   group_name: 'notification',
  // },
  {
    name: 'Delete Notification',
    kebab: 'delete-notification',
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

  // Data/Peer/Graph management permissions
  {
    name: 'View Data',
    kebab: 'view-data',
    group_name: 'data',
  },
  {
    name: 'Create Data',
    kebab: 'create-data',
    group_name: 'data',
  },
  {
    name: 'Update Data',
    kebab: 'update-data',
    group_name: 'data',
  },
  // {
  //   name: 'Archive Data',
  //   kebab: 'archive-data',
  //   group_name: 'data',
  // },
  {
    name: 'Delete Data',
    kebab: 'delete-data',
    group_name: 'data',
  },
  {
    name: 'Download Data',
    kebab: 'download-data',
    group_name: 'data',
  },
  {
    name: 'Request Data', // Main peer request permission
    kebab: 'request-data',
    group_name: 'data',
  },
] as const;

export type PermissionsKebabType = typeof permissions[number]['kebab'];
export default permissions;
