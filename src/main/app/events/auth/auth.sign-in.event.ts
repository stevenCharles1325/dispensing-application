import handleError from 'Main/app/modules/error-handler';
import AuthService from 'Main/app/services/auth.service';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/app/interfaces/event.interface';
import ResponseContract from 'Main/app/interfaces/response-contract';
import Provider from 'Main/provider';

export default class AuthSignIn implements EventContract {
  public channel: string = 'auth:sign-in';

  public async listener({ eventData }: EventListenerPropertiesContract) {
    try {
      const { email, password } = eventData.payload[0];
      const authService = Provider.ioc<AuthService>('AuthProvider');

      return (await authService.authenticate(
        email,
        password
      )) as ResponseContract;
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
