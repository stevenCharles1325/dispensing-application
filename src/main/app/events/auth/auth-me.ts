import handleError from 'Main/app/modules/error-handler';
import AuthService from 'Main/app/services/AuthService';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import { User } from 'Main/database/models/User';
import Provider from 'Main/provider';

export default class AuthMe implements EventContract {
  public channel: string = 'auth:me';

  public async listener({ storage }: EventListenerPropertiesContract) {
    try {
      const authUser = storage.get('POS_AUTH_USER') as User;

      if (authUser) {
        return {
          data: authUser,
          status: 'SUCCESS',
        };
      }

      return {
        errors: ['Unauthorized user. Please login first.'],
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
