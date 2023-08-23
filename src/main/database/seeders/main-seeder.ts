/* eslint-disable no-restricted-syntax */
import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import permissions from 'Main/data/defaults/permissions';
import requireAll from 'Main/app/modules/require-all';
import PermissionContract from 'Main/contracts/permission-contract';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';

const roles = requireAll(`${__dirname}/../../data/defaults/roles`, true);

export default class MainSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const PermissionRepo = dataSource.getRepository(Permission);
    const RoleRepo = dataSource.getRepository(Role);
    const UserRepo = dataSource.getRepository(User);

    console.log('Permissions: ', permissions);

    const createdPermissions = await PermissionRepo.insert(permissions);
    console.log('[SEEDER]: Seeded Permissions successfully');

    if (roles) {
      console.log('ROLES: ', roles);

      for await (const roleObj of Object.values(roles)) {
        if (roleObj?.permissions) {
          console.log('ROLE PERMISSIONS: ', roleObj.permissions);
          const permissionNames = roleObj.permissions.map(
            (permission: PermissionContract) => permission.kebab
          );

          const perms = (await createdPermissions.generatedMaps.filter(
            ({ kebab }) => permissionNames.includes(kebab)
          )) as Permission[];

          console.log('PERMS: ', perms);
          const role = RoleRepo.create({
            name: roleObj!.name,
            kebab: roleObj!.kebab,
          });

          role.permissions = perms;
          await RoleRepo.save(role);
        } else {
          await RoleRepo.insert([roleObj]);
        }
      }

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
