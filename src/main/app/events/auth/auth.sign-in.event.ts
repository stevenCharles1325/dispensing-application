import Provider from '@IOC:Provider';
import IAuth from 'App/interfaces/auth/auth.interface';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import handleError from 'App/modules/error-handler.module';
import { User } from 'Main/database/models/user.model';

export default class AuthSignIn implements IEvent {
  public channel: string = 'auth:sign-in';

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<IAuth<User> | IPOSError[] | any> {
    try {
      const { email, password } = eventData.payload[0];
      const authService = Provider.ioc<IAuthService>('AuthProvider');

      return await authService.authenticate(email, password);
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
