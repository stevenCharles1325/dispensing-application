import Provider from '@IOC:Provider';
import IEvent from 'Interfaces/event/event.interface';
import IEventListenerProperties from 'Interfaces/event/event.listener-props.interface';
import IResponse from 'Interfaces/pos/pos.response.interface';
import handleError from 'Modules/error-handler.module';
import AuthService from 'Services/auth.service';

export default class AuthMe implements IEvent {
  public channel: string = 'auth:me';

  public async listener({ eventData }: IEventListenerProperties) {
    try {
      const authService = Provider.ioc<AuthService>('AuthProvider');
      const token = eventData.user?.token;

      return authService.verifyToken(token);
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
