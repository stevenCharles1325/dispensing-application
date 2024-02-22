import RoleDTO from 'App/data-transfer-objects/role.dto';

const administrator: RoleDTO = {
  id: process.env.DEFAULT_ADMIN_ROLE_ID as string,
  name: 'Administrator',
  kebab: 'administrator',
  permissions: [
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
      name: 'View Audit Trail',
      kebab: 'view-audit-trail',
      group_name: 'audit-trail',
    },
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
      name: 'Upload Data',
      kebab: 'upload-data',
      group_name: 'data',
    },
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
      name: 'View Notification',
      kebab: 'view-notification',
      group_name: 'notification',
    },
    {
      name: 'View Permission',
      kebab: 'view-permission',
      group_name: 'permission',
    },
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
      name: 'View System',
      kebab: 'view-system',
      group_name: 'system',
    },
  ] as unknown as any[],
};

export default administrator;
