import Provider from '@IOC:Provider';
import IEvent from 'Interfaces/event/event.interface';
import IEventListenerProperties from 'Interfaces/event/event.listener-props.interface';
import IResponse from 'Interfaces/pos/pos.response.interface';
import handleError from 'Modules/error-handler.module';
import UserRepository from 'Repositories/user.repository';
import AuthService from 'Services/auth.service';
import validator from 'Modules/validator.module';

export default class AuthSignUpEvent implements IEvent {
  public channel: string = 'auth:sign-up';

  public async listener({ eventData }: IEventListenerProperties) {
    try {
      const user = UserRepository.create(eventData.payload[0]);
      const authService = Provider.ioc<AuthService>('AuthProvider');

      const errors = await validator(user);
      if (errors && errors.length) {
        return {
          errors,
          code: 'VALIDATION_ERR',
          status: 'ERROR',
        } as IResponse;
      }

      const data = (await UserRepository.save(user))[0];
      return (await authService.authenticate(
        data.email,
        data.password
      )) as IResponse;
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
