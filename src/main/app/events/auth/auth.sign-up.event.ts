import UserRepository from 'Main/app/repositories/User-repository';
import handleError from 'Main/app/modules/error-handler';
import validator from 'Main/app/modules/validator.module';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/app/interfaces/event.interface';
import Provider from '@IOC:Provider';
import AuthService from 'Main/app/services/auth.service';
import ResponseContract from 'Main/app/interfaces/response-contract';

export default class AuthSignUpEvent implements EventContract {
  public channel: string = 'auth:sign-up';

  public async listener({ eventData }: EventListenerPropertiesContract) {
    try {
      const user = UserRepository.create(eventData.payload[0]);
      const authService = Provider.ioc<AuthService>('AuthProvider');

      const errors = await validator(user);
      if (errors && errors.length) {
        return {
          errors,
          code: 'VALIDATION_ERR',
          status: 'ERROR',
        } as ResponseContract;
      }

      const data = (await UserRepository.save(user))[0];
      return (await authService.authenticate(
        data.email,
        data.password
      )) as ResponseContract;
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