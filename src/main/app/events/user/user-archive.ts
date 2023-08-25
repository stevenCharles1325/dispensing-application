import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import { SqliteDataSource } from 'Main/datasource';
import { User } from 'Main/database/models/User';

export default class UserArchiveEvent implements EventContract {
  public channel: string = 'user:archive';

  public async listener({ eventArgs }: EventListenerPropertiesContract) {
    try {
      const userRepo = SqliteDataSource.getRepository(User);
      const data = await userRepo.softDelete(eventArgs[0]);

      return {
        data,
        errors: [],
        status: 'SUCCESS',
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
