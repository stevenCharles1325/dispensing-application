import PermissionDTO from 'App/data-transfer-objects/permission.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import handleError from 'App/modules/error-handler.module';
import { Permission } from 'Main/database/models/permission.model';
import { SqliteDataSource } from 'Main/datasource';
import { Bull } from 'Main/jobs';

export default class PermissionArchiveEvent implements IEvent {
  public channel: string = 'permission:archive';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | any>
  > {
    try {
      const { user } = eventData;
      const id: Permission['id'] = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.('archive-permission');

      if (requesterHasPermission) {
        const permissionRepo = SqliteDataSource.getRepository(Permission);
        const data = await permissionRepo.softDelete(id);

        await Bull('AUDIT_JOB', {
          user_id: user.id as number,
          resource_id: id.toString(),
          resource_table: 'permissions',
          resource_id_type: 'integer',
          action: 'archive',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully archived a Permission`,
        });

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_table: 'permissions',
        action: 'archive',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to archive a Permission`,
      });

      return {
        errors: ['You are not allowed to archive a Permission'],
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
