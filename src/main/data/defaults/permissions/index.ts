/* eslint-disable prettier/prettier */

const permissions = [
  // Audit-Trail permissions
  {
    name: 'View Audit Trail',
    kebab: 'view-audit-trail',
  },

  // Audit-Trail permissions
  {
    name: 'View Report',
    kebab: 'view-report',
  },

  // Role management permissions
  {
    name: 'View Role',
    kebab: 'view-role',
  },
  {
    name: 'Create Role',
    kebab: 'create-role',
  },
  {
    name: 'Update Role',
    kebab: 'update-role',
  },
  {
    name: 'Archive Role',
    kebab: 'archive-role',
  },
  {
    name: 'Delete Role',
    kebab: 'delete-role',
  },

  // Permission management permissions
  {
    name: 'View Permission',
    kebab: 'view-permission',
  },
  {
    name: 'Create Permission',
    kebab: 'create-permission',
  },
  {
    name: 'Update Permission',
    kebab: 'update-permission',
  },
  {
    name: 'Archive Permission',
    kebab: 'archive-permission',
  },
  {
    name: 'Delete Permission',
    kebab: 'delete-permission',
  },

  // User/Employee management permissions
  {
    name: 'View User',
    kebab: 'view-user',
  },
  {
    name: 'Create User',
    kebab: 'create-user',
  },
  {
    name: 'Update User',
    kebab: 'update-user',
  },
  {
    name: 'Archive User',
    kebab: 'archive-user',
  },
  {
    name: 'Delete User',
    kebab: 'delete-user',
  },

  // Inventory management permissions
  {
    name: 'View Item',
    kebab: 'view-item',
  },
  {
    name: 'Create Item',
    kebab: 'create-item',
  },
  {
    name: 'Update Item',
    kebab: 'update-item',
  },
  {
    name: 'Archive Item',
    kebab: 'archive-item',
  },
  {
    name: 'Delete Item',
    kebab: 'delete-item',
  },

  // Category management permissions
  {
    name: 'View Category',
    kebab: 'view-category',
  },
  {
    name: 'Create Category',
    kebab: 'create-category',
  },
  {
    name: 'Update Category',
    kebab: 'update-category',
  },
  {
    name: 'Archive Category',
    kebab: 'archive-category',
  },
  {
    name: 'Delete Category',
    kebab: 'delete-category',
  },

  // Brand management permissions
  {
    name: 'View Brand',
    kebab: 'view-brand',
  },
  {
    name: 'Create Brand',
    kebab: 'create-brand',
  },
  {
    name: 'Update Brand',
    kebab: 'update-brand',
  },
  {
    name: 'Archive Brand',
    kebab: 'archive-brand',
  },
  {
    name: 'Delete Brand',
    kebab: 'delete-brand',
  },

  // Supplier management permissions
  {
    name: 'View Supplier',
    kebab: 'view-supplier',
  },
  {
    name: 'Create Supplier',
    kebab: 'create-supplier',
  },
  {
    name: 'Update Supplier',
    kebab: 'update-supplier',
  },
  {
    name: 'Archive Supplier',
    kebab: 'archive-supplier',
  },
  {
    name: 'Delete Supplier',
    kebab: 'delete-supplier',
  },

  // Image management permissions
  {
    name: 'View Image',
    kebab: 'view-image',
  },
  {
    name: 'Create Image',
    kebab: 'create-image',
  },
  {
    name: 'Update Image',
    kebab: 'update-image',
  },
  {
    name: 'Archive Image',
    kebab: 'archive-image',
  },
  {
    name: 'Delete Image',
    kebab: 'delete-image',
  },

  // Transaction management permissions
  {
    name: 'View Transaction',
    kebab: 'view-transaction',
  },
  {
    name: 'Create Transaction',
    kebab: 'create-transaction',
  },
  {
    name: 'Update Transaction',
    kebab: 'update-transaction',
  },
  {
    name: 'Archive Transaction',
    kebab: 'archive-transaction',
  },
  {
    name: 'Delete Transaction',
    kebab: 'delete-transaction',
  },

  // Attendance management permissions
  {
    name: 'View Attendance',
    kebab: 'view-attendance',
  },
  {
    name: 'Create Attendance',
    kebab: 'create-attendance',
  },
  {
    name: 'Update Attendance',
    kebab: 'update-attendance',
  },
  {
    name: 'Archive Attendance',
    kebab: 'archive-attendance',
  },
  {
    name: 'Delete Attendance',
    kebab: 'delete-attendance',
  },

  // Transaction management permissions
  // Customer Payment permissions
  {
    name: 'View Customer Payment',
    kebab: 'view-customer-payment',
  },
  {
    name: 'Create Customer Payment',
    kebab: 'create-customer-payment',
  },
  {
    name: 'Update Customer Payment',
    kebab: 'update-customer-payment',
  },
  {
    name: 'Archive Customer Payment',
    kebab: 'archive-customer-payment',
  },
  {
    name: 'Delete Customer Payment',
    kebab: 'delete-customer-payment',
  },
  // Refund permissions
  {
    name: 'View Refund',
    kebab: 'view-refund',
  },
  {
    name: 'Create Refund',
    kebab: 'create-refund',
  },
  {
    name: 'Update Refund',
    kebab: 'update-refund',
  },
  {
    name: 'Archive Refund',
    kebab: 'archive-refund',
  },
  {
    name: 'Delete Refund',
    kebab: 'delete-refund',
  },
  // Bill permissions
  {
    name: 'View Bill',
    kebab: 'view-bill',
  },
  {
    name: 'Create Bill',
    kebab: 'create-bill',
  },
  {
    name: 'Update Bill',
    kebab: 'update-bill',
  },
  {
    name: 'Archive Bill',
    kebab: 'archive-bill',
  },
  {
    name: 'Delete Bill',
    kebab: 'delete-bill',
  },
  // Salary permissions
  {
    name: 'View Salary',
    kebab: 'view-salary',
  },
  {
    name: 'Create Salary',
    kebab: 'create-salary',
  },
  {
    name: 'Update Salary',
    kebab: 'update-salary',
  },
  {
    name: 'Archive Salary',
    kebab: 'archive-salary',
  },
  {
    name: 'Delete Salary',
    kebab: 'delete-salary',
  },
  // Restocking permissions
  {
    name: 'View Restocking',
    kebab: 'view-restocking',
  },
  {
    name: 'Create Restocking',
    kebab: 'create-restocking',
  },
  {
    name: 'Update Restocking',
    kebab: 'update-restocking',
  },
  {
    name: 'Archive Restocking',
    kebab: 'archive-restocking',
  },
  {
    name: 'Delete Restocking',
    kebab: 'delete-restocking',
  },

   // Notification permissions
   {
    name: 'View Notification',
    kebab: 'view-notification',
  },
  {
    name: 'Create Notification',
    kebab: 'create-notification',
  },
  {
    name: 'Update Notification',
    kebab: 'update-notification',
  },
  {
    name: 'Archive Notification',
    kebab: 'archive-notification',
  },
  {
    name: 'Delete Notification',
    kebab: 'delete-notification',
  },

  // Data/Peer/Graph management permissions
  {
    name: 'View Data',
    kebab: 'view-data',
  },
  {
    name: 'Create Data',
    kebab: 'create-data',
  },
  {
    name: 'Update Data',
    kebab: 'update-data',
  },
  {
    name: 'Archive Data',
    kebab: 'archive-data',
  },
  {
    name: 'Delete Data',
    kebab: 'delete-data',
  },
  {
    name: 'Download Data',
    kebab: 'download-data',
  },
  {
    name: 'Request Data', // Main peer request permission
    kebab: 'request-data',
  },
] as const;

export type PermissionsKebabType = typeof permissions[number]['kebab'];
export default permissions;
