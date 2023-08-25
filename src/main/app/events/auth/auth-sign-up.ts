import UserRepository from 'Main/app/repositories/User-repository';
import handleError from 'Main/app/modules/error-handler';
import validator from 'Main/app/modules/validator';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import Provider from '@IOC:Provider';
import AuthService from 'Main/app/services/AuthService';

export default class AuthSignUpEvent implements EventContract {
  public channel: string = 'auth:sign-up';

  public async listener({ eventArgs }: EventListenerPropertiesContract) {
    try {
      const user = UserRepository.create(eventArgs[0]);
      const authService = Provider.ioc<AuthService>('AuthProvider');

      const errors = await validator(user);
      if (errors && errors.length) {
        return {
          errors,
          status: 'ERROR',
        };
      }

      const data = (await UserRepository.save(user))[0];
      return await authService.authenticate(data.email, data.password);
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        status: 'ERROR',
      };
    }
  }
}
