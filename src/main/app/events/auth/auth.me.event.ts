import Provider from '@IOC:Provider';
import UserDTO from 'App/data-transfer-objects/user.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import handleError from 'App/modules/error-handler.module';

export default class AuthMe implements IEvent {
  public channel: string = 'auth:me';

  public async listener(): Promise<Partial<UserDTO> | IPOSError[] | any> {
    try {
      const authService = Provider.ioc<IAuthService>('AuthProvider');
      const { token } = authService.getAuthToken();

      console.log(`token: ${token}`);
      return authService.verifyToken(token);
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
