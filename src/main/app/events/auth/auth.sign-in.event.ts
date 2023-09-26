import Provider from '@IOC:Provider';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import handleError from 'App/modules/error-handler.module';

export default class AuthSignIn implements IEvent {
  public channel: string = 'auth:sign-in';

  public async listener({ eventData }: IEventListenerProperties) {
    try {
      const { email, password } = eventData.payload[0];
      const authService = Provider.ioc<IAuthService>('AuthProvider');

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
