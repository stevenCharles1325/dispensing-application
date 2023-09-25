import handleError from 'Main/app/modules/error-handler';
import EventContract from 'Main/app/interfaces/event.interface';
import Provider from '@IOC:Provider';
import AuthService from 'Main/app/services/auth.service';
import ResponseContract from 'Main/app/interfaces/response-contract';

export default class AuthSignOutEvent implements EventContract {
  public channel: string = 'auth:sign-out';

  public middlewares = ['auth-middleware'];

  public async listener() {
    try {
      const authService = Provider.ioc<AuthService>('AuthProvider');

      return (await authService.revoke()) as ResponseContract;
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
