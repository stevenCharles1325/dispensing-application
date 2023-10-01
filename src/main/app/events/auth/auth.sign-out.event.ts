import Provider from '@IOC:Provider';
import IAuth from 'App/interfaces/auth/auth.interface';
import IEvent from 'App/interfaces/event/event.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import handleError from 'App/modules/error-handler.module';
import { User } from 'Main/database/models/user.model';

export default class AuthSignOutEvent implements IEvent {
  public channel: string = 'auth:sign-out';

  public middlewares = ['auth.middleware'];

  public async listener(): Promise<null | IPOSError[] | any> {
    try {
      const authService = Provider.ioc<IAuthService>('AuthProvider');

      return await authService.revoke();
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        code: 'SYS_ERR',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
