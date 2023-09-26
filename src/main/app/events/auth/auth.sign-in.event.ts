import Provider from '@IOC:Provider';
import IEvent from 'Interfaces/event/event.interface';
import IEventListenerProperties from 'Interfaces/event/event.listener-props.interface';
import IResponse from 'Interfaces/pos/pos.response.interface';
import handleError from 'Modules/error-handler.module';
import AuthService from 'Services/auth.service';

export default class AuthSignIn implements IEvent {
  public channel: string = 'auth:sign-in';

  public async listener({ eventData }: IEventListenerProperties) {
    try {
      const { email, password } = eventData.payload[0];
      const authService = Provider.ioc<AuthService>('AuthProvider');

      return (await authService.authenticate(email, password)) as IResponse;
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
