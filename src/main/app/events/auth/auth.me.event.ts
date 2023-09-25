import Provider from '@IOC:Provider';
import handleError from 'Main/app/modules/error-handler';
import AuthService from 'Main/app/services/auth.service';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/app/interfaces/event.interface';
import ResponseContract from 'Main/app/interfaces/response.interface';

export default class AuthMe implements EventContract {
  public channel: string = 'auth:me';

  public async listener({ eventData }: EventListenerPropertiesContract) {
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
      } as ResponseContract;
    }
  }
}
