import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/app/interfaces/event.interface';
import { SqliteDataSource } from 'Main/datasource';
import { Role } from 'Main/database/models/role.model';
import ResponseContract from 'Main/app/interfaces/response-contract';

export default class RoleDeleteEvent implements EventContract {
  public channel: string = 'role:delete';

  public middlewares = ['auth-middleware'];

  public async listener({ eventData }: EventListenerPropertiesContract) {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('delete-role');

      if (requesterHasPermission) {
        const roleRepo = SqliteDataSource.getRepository(Role);
        const data = await roleRepo.delete(eventData.payload[0]);

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as ResponseContract;
      }

      return {
        errors: ['You are not allowed to delete a Role'],
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