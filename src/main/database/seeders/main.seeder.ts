/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import permissions from 'Main/data/defaults/permissions';
import PermissionDTO from 'App/data-transfer-objects/permission.dto';
import { Permission } from '../models/permission.model';
import { Role } from '../models/role.model';
import { System } from '../models/system.model';
import { User } from '../models/user.model';
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
    const UserRepo = dataSource.getRepository(User);
    const SystemRepo = dataSource.getRepository(System);

    const isDBHasMainSystem = await SystemRepo.findOneBy({
      store_name: 'sari-sari store',
    });

    if (!isDBHasMainSystem) {
      const _system = SystemRepo.create({
        is_branch: false,
        store_name: 'sari-sari store',
      });

      const system = await SystemRepo.save(_system);
      console.log(system);
      await SystemRepo.save({
        ...system,
        main_branch_id: system.uuid,
      });
    }

    const createdPermissions = PermissionRepo.create(
      permissions as unknown as Array<Partial<Permission>>
    );
    await PermissionRepo.save(createdPermissions);
    console.log('[SEEDER]: Seeded Permissions successfully');

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

            console.log(perms);

            _role['permissions'] = perms;
            return _role;
          }

          return role;
        })
      );

      await RoleRepo.save(_roles);

      console.log('[SEEDER]: Seeded Roles successfully');
      const ownerRole = await RoleRepo.findOneByOrFail({ name: 'Owner' });

      const user = UserRepo.create({
        first_name: 'John',
        last_name: 'Doe',
        email: 'johndoe123@gmail.com',
        password: 'passWORD123@@@',
        birth_date: new Date(),
        address: 'sample address 123',
        phone_number: '+639123123123',
        notification_status: 'on',
      });

      user.role = ownerRole;
      await UserRepo.save(user);
    }
  }
}
