/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import permissions from 'Main/data/defaults/permissions';
import requireAll from 'Main/app/modules/require-all';
import PermissionContract from 'Main/contracts/permission-contract';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import { System } from '../models/System';

const roles = requireAll(`${__dirname}/../../data/defaults/roles`, true);

export default class MainSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const PermissionRepo = dataSource.getRepository(Permission);
    const RoleRepo = dataSource.getRepository(Role);
    const UserRepo = dataSource.getRepository(User);
    const SystemRepo = dataSource.getRepository(System);

    const _system = SystemRepo.create({
      is_branch: false,
      store_name: 'sari-sari store',
    });

    const system = await SystemRepo.save(_system);
    await SystemRepo.save({
      ...system,
      main_branch_id: system.id,
    });

    const createdPermissions = PermissionRepo.create(
      permissions as unknown as Array<Partial<Permission>>
    );
    await PermissionRepo.save(createdPermissions);
    console.log('[SEEDER]: Seeded Permissions successfully');

    if (roles) {
      const _roles = RoleRepo.create(
        Object.values(roles).map((role) => {
          if (role?.permissions) {
            console.log('ROLE PERMISSIONS: ', role.permissions);
            const permissionNames = role.permissions.map(
              (permission: PermissionContract) => permission.kebab
            );

            const perms = createdPermissions.filter(({ kebab }) =>
              permissionNames.includes(kebab)
            ) as Permission[];

            console.log('PERMS: ', perms);
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

      console.log('ROLES: ', roles);
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
      });

      user.role = ownerRole;
      await UserRepo.save(user);
    }
  }
}
