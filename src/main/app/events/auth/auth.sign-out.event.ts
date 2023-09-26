import Provider from '@IOC:Provider';
import IEvent from 'App/interfaces/event/event.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import handleError from 'App/modules/error-handler.module';

export default class AuthSignOutEvent implements IEvent {
  public channel: string = 'auth:sign-out';

  public middlewares = ['auth.middleware'];

  public async listener() {
    try {
      const authService = Provider.ioc<IAuthService>('AuthProvider');

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
