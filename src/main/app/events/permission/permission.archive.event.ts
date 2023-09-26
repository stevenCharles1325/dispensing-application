import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import { Permission } from 'Main/database/models/permission.model';
import { SqliteDataSource } from 'Main/datasource';

export default class PermissionArchiveEvent implements IEvent {
  public channel: string = 'permission:archive';

  public middlewares = ['auth.middleware'];

  public async listener({ eventData }: IEventListenerProperties) {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('archive-permission');

      if (requesterHasPermission) {
        const permissionRepo = SqliteDataSource.getRepository(Permission);
        const data = await permissionRepo.softDelete(eventData.payload[0]);

        return {
          data,
          errors: [],
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse;
      }

      return {
        errors: ['You are not allowed to archive a Permission'],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as IResponse;
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        code: 'SYS_ERR',
        status: 'ERROR',
      } as IResponse;
    }
  }
}
