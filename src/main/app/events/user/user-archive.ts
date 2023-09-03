import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import { SqliteDataSource } from 'Main/datasource';
import { User } from 'Main/database/models/User';

export default class UserArchiveEvent implements EventContract {
  public channel: string = 'user:archive';

  public middlewares = ['auth-middleware'];

  public async listener({ eventData }: EventListenerPropertiesContract) {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('create-user');

      if (requesterHasPermission) {
        const userRepo = SqliteDataSource.getRepository(User);
        const data = await userRepo.softDelete(eventData.payload);

        return {
          data,
          errors: [],
          status: 'SUCCESS',
        };
      }

      return {
        errors: ['You are not allowed to create a User'],
        status: 'ERROR',
      };
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        status: 'ERROR',
      };
    }
  }
}
