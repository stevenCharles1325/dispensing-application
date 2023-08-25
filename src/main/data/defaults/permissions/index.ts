/* eslint-disable prettier/prettier */

const permissions = [
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

  // Data/Graph management permissions
  {
    name: 'View Data',
    kebab: 'view-data',
  },
  {
    name: 'Download Data',
    kebab: 'download-data',
  },
] as const;

export type PermissionsKebabType = typeof permissions[number]['kebab'];
export default permissions;
