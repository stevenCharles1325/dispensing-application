/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Role } from '../models/role.model';
import { Permission } from '../models/permission.model';
import permissions from 'Main/data/defaults/permissions';
import PermissionDTO from 'App/data-transfer-objects/permission.dto';
import administrator from 'Main/data/defaults/roles/administrator';
import cashier from 'Main/data/defaults/roles/cashier';
import storeManager from 'Main/data/defaults/roles/store-manager';
import owner from 'Main/data/defaults/roles/owner';

const roles = {
  administrator,
  cashier,
  storeManager,
  owner,
};

export default class MainSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    console.log('RUNNING SEEDER...');

    const PermissionRepo = dataSource.getRepository(Permission);
    const RoleRepo = dataSource.getRepository(Role);

    const createdPermissions = PermissionRepo.create(
      permissions as unknown as Array<Partial<Permission>>
    );
    await PermissionRepo.save(createdPermissions);
    console.log('[SEEDER]: Seeded Permissions Successfully');

    if (roles) {
      const _roles = RoleRepo.create(
        Object.values(roles).map((role) => {
          if (role?.permissions) {
            const permissionNames = role.permissions.map(
              (permission: PermissionDTO) => permission.kebab
            );

            const perms = createdPermissions.filter(({ kebab }) =>
              permissionNames.includes(kebab)
            ) as Permission[];

            const _role: any = {
              name: role!.name,
              kebab: role!.kebab,
            };

            _role['permissions'] = perms;
            return _role;
          }

          return role;
        })
      );

      await RoleRepo.save(_roles);

      console.log('[SEEDER]: Seeded Roles Successfully');
    }
  }
}
