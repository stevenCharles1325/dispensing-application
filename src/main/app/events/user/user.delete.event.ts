import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/app/interfaces/event.interface';
import { SqliteDataSource } from 'Main/datasource';
import { User } from 'Main/database/models/User';
import ResponseContract from 'Main/app/interfaces/response-contract';

export default class UserDeleteEvent implements EventContract {
  public channel: string = 'user:delete';

  public middlewares = ['auth-middleware'];

  public async listener({ eventData }: EventListenerPropertiesContract) {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('delete-user');

      if (requesterHasPermission) {
        const userRepo = SqliteDataSource.getRepository(User);
        const data = await userRepo.delete(eventData.payload[0]);

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as ResponseContract;
      }

      return {
        errors: ['You are not allowed to delete a User'],
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
