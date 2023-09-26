import IEvent from 'Interfaces/event/event.interface';
import IEventListenerProperties from 'Interfaces/event/event.listener-props.interface';
import IResponse from 'Interfaces/pos/pos.response.interface';
import { SqliteDataSource } from 'Main/datasource';
import { Permission } from 'Models/permission.model';
import handleError from 'Modules/error-handler.module';

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
