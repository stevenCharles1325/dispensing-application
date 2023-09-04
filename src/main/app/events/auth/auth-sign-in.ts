import handleError from 'Main/app/modules/error-handler';
import AuthService from 'Main/app/services/AuthService';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import Provider from 'Main/provider';

export default class AuthSignIn implements EventContract {
  public channel: string = 'auth:sign-in';

  public async listener({ eventData }: EventListenerPropertiesContract) {
    try {
      const { email, password } = eventData.payload[0];
      const authService = Provider.ioc<AuthService>('AuthProvider');

      return authService.authenticate(email, password);
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
