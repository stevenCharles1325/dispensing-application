import Provider from '@IOC:Provider';
import RoleDTO from 'App/data-transfer-objects/role.dto';
import UserDTO from 'App/data-transfer-objects/user.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import handleError from 'App/modules/error-handler.module';
import parseTimeExpression from 'App/modules/parse-time-expression.module';
import validator from 'App/modules/validator.module';
import PermissionRepository from 'App/repositories/permission.repository';
import RoleRepository from 'App/repositories/role.repository';
import UserRepository from 'App/repositories/user.repository';
import { Role } from 'Main/database/models/role.model';
import { Bull } from 'Main/jobs';
import { In } from "typeorm"

export default class RoleUpdateEvent implements IEvent {
  public channel: string = 'role:update';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | RoleDTO | any>
  > {
    try {
      const { user } = eventData;
      const id = eventData.payload[0];
      const roleUpdate: Role = eventData.payload[1];
      const permissionIds: number[] = eventData.payload[2] ?? [];

      const authService = Provider.ioc<IAuthService>('AuthProvider');
      const requesterHasPermission = user.hasPermission?.('update-role');

      if (requesterHasPermission) {
        const role = await RoleRepository.findOneByOrFail({
          id,
        });
        const updatedRole = RoleRepository.merge(role, roleUpdate);
        const errors = await validator(updatedRole);

        if (errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        if (permissionIds.length) {
          const permissions = await PermissionRepository.findBy({
            id: In(permissionIds),
          });
          updatedRole.permissions = permissions;
        }

        await Bull('AUDIT_JOB', {
          user_id: user.id as number,
          resource_id: id.toString(),
          resource_table: 'roles',
          resource_id_type: 'integer',
          action: 'update',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully updated a Role`,
        });

        const data: Role = await RoleRepository.save(updatedRole);
        const authUser = await UserRepository.findOneBy({ id: user!.id as number });

        if (authUser && data.id === authUser.role_id) {
          authUser.role = data;
          const userUpdated = await UserRepository.save(authUser);

          const user_data = {
            id: userUpdated.id,
            email: userUpdated.email,
            image_url: userUpdated.image_url,
            first_name: userUpdated.first_name,
            last_name: userUpdated.last_name,
            full_name: userUpdated.fullName(),
            phone_number: userUpdated.phone_number,
            notification_status: userUpdated.notification_status,
            role: userUpdated.role,
          };

          const [token, refresh_token] = authService.generateToken(user_data);
          const payload = {
            token,
            refresh_token,
            user: userUpdated.serialize('password') as UserDTO,
            token_expires_at: parseTimeExpression(
              authService.config.token_expires_at
            ),
            refresh_token_expires_at: parseTimeExpression(
              authService.config.refresh_token_expires_at
            ),
          };

          authService.setAuthUser(payload);
        }

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_id: id.toString(),
        resource_table: 'roles',
        resource_id_type: 'integer',
        action: 'update',
        status: 'FAILED',
        description: `User ${user.fullName} has failed to update a Role`,
      });

      return {
        errors: ['You are not allowed to update a Role'],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as unknown as IResponse<string[]>;
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        code: 'SYS_ERR',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
