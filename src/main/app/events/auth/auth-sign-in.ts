import handleError from 'Main/app/modules/error-handler';
import AuthService from 'Main/app/services/AuthService';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import Provider from 'Main/provider';

export default class AuthSignIn implements EventContract {
  public channel: string = 'auth:sign-in';

  public async listener({ eventArgs }: EventListenerPropertiesContract) {
    try {
      console.log(eventArgs);
      const { email, password } = eventArgs[0];
      const authService = Provider.ioc<AuthService>('AuthProvider');

      try {
        return authService.authenticate(email, password);
      } catch (err) {
        const error = handleError(err);

        return {
          errors: [error],
          status: 'ERROR',
        };
      }
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
