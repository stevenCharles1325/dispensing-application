import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import { SqliteDataSource } from 'Main/datasource';
import { User } from 'Main/database/models/User';

export default class UserArchiveEvent implements EventContract {
  public channel: string = 'user:archive';

  public middlewares = ['auth-middleware'];

  public async listener({
    eventArgs,
    storage,
  }: EventListenerPropertiesContract) {
    try {
      const authUser = storage.get('POS_AUTH_USER') as User;
      const hasPermission = authUser.hasPermission('archive-user');

      if (hasPermission) {
        const userRepo = SqliteDataSource.getRepository(User);
        const data = await userRepo.softDelete(eventArgs[0]);

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
