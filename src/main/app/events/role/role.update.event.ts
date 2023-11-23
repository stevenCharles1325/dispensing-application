import RoleDTO from 'App/data-transfer-objects/role.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import handleError from 'App/modules/error-handler.module';
import validator from 'App/modules/validator.module';
import PermissionRepository from 'App/repositories/permission.repository';
import RoleRepository from 'App/repositories/role.repository';
import { Role } from 'Main/database/models/role.model';
import { Bull } from 'Main/jobs';
import { In } from "typeorm"

export default class UserDeleteEvent implements IEvent {
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
