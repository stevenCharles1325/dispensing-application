/* eslint-disable no-restricted-syntax */
import RoleDTO from 'App/data-transfer-objects/role.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import handleError from 'App/modules/error-handler.module';
import { Role } from 'Main/database/models/role.model';
import { SqliteDataSource } from 'Main/datasource';
import { Bull } from 'Main/jobs';

export default class RoleDeleteEvent implements IEvent {
  public channel: string = 'role:delete';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | any>
  > {
    try {
      const { user } = eventData;
      const payload: Role['id'] = eventData.payload[0];
      const requesterHasPermission =
        eventData.user.hasPermission?.('delete-role');

      const defaultRoleIds = [
        process.env.DEFAULT_ADMIN_ROLE_ID,
        process.env.DEFAULT_CASHIER_ROLE_ID,
        process.env.DEFAULT_OWNER_ROLE_ID,
        process.env.DEFAULT_STORE_MANAGER_ROLE_ID,
      ];

      if (
        (typeof payload === 'string' && defaultRoleIds.includes(payload)) ||
        (Array.isArray(payload) && payload.some((id ) => defaultRoleIds.includes(id)))
       ) {
        return {
          errors: ['You are not allowed to delete a default Role.'],
          code: 'SYS_ERR',
          status: 'ERROR',
        } as unknown as IResponse<string[]>;
      }

      if (requesterHasPermission) {
        const roleRepo = SqliteDataSource.getRepository(Role);
        const data = await roleRepo.delete(payload);

        if (Array.isArray(payload)) {
          for await (const id of payload) {
            await Bull('AUDIT_JOB', {
              user_id: user.id as unknown as string,
              resource_id: id.toString(),
              resource_table: 'roles',
              resource_id_type: 'uuid',
              action: 'delete',
              status: 'SUCCEEDED',
              description: `User ${user.fullName} has successfully deleted a Role`,
            });
          }
        } else {
          await Bull('AUDIT_JOB', {
            user_id: user.id as unknown as string,
            resource_id: payload.toString(),
            resource_table: 'roles',
            resource_id_type: 'uuid',
            action: 'delete',
            status: 'SUCCEEDED',
            description: `User ${user.fullName} has successfully deleted a Role`,
          });
        }

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as unknown as string,
        resource_table: 'roles',
        action: 'delete',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to delete a Role`,
      });

      return {
        errors: ['You are not allowed to delete a Role'],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as unknown as IResponse<string[]>;
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      if (error?.code === 19) {
        return {
          errors: ['cannot delete a brand that has attached employee'],
          code: 'SYS_ERR',
          status: 'ERROR',
        } as unknown as IResponse<IPOSError[]>;
      }

      return {
        errors: [error],
        code: 'SYS_ERR',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
