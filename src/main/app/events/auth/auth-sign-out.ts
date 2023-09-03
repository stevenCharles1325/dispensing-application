import handleError from 'Main/app/modules/error-handler';
import EventContract from 'Main/contracts/event-contract';
import Provider from '@IOC:Provider';
import AuthService from 'Main/app/services/AuthService';

export default class AuthSignUpEvent implements EventContract {
  public channel: string = 'auth:sign-up';

  public middlewares = ['auth-middleware'];

  public async listener() {
    try {
      const authService = Provider.ioc<AuthService>('AuthProvider');

      return await authService.revoke();
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
