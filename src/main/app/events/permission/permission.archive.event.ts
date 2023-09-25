import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/app/interfaces/event.interface';
import { SqliteDataSource } from 'Main/datasource';
import { Permission } from 'Main/database/models/permission.model';
import ResponseContract from 'Main/app/interfaces/response-contract';

export default class PermissionArchiveEvent implements EventContract {
  public channel: string = 'permission:archive';

  public middlewares = ['auth-middleware'];

  public async listener({ eventData }: EventListenerPropertiesContract) {
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
        } as ResponseContract;
      }

      return {
        errors: ['You are not allowed to archive a Permission'],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as ResponseContract;
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        code: 'SYS_ERR',
        status: 'ERROR',
      } as ResponseContract;
    }
  }
}
