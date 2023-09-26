import Provider from '@IOC:Provider';
import IEvent from 'Interfaces/event/event.interface';
import IResponse from 'Interfaces/pos/pos.response.interface';
import handleError from 'Modules/error-handler.module';
import AuthService from 'Services/auth.service';

export default class AuthSignOutEvent implements IEvent {
  public channel: string = 'auth:sign-out';

  public middlewares = ['auth-middleware'];

  public async listener() {
    try {
      const authService = Provider.ioc<AuthService>('AuthProvider');

      return (await authService.revoke()) as IResponse;
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        code: 'SYS_ERR',
        status: 'ERROR',
      } as IResponse;
    }
  }
}
