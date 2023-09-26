import Provider from '@IOC:Provider';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import UserRepository from 'App/repositories/user.repository';
import validator from 'App/modules/validator.module';
import IAuthService from 'App/interfaces/service/service.auth.interface';

export default class AuthSignUpEvent implements IEvent {
  public channel: string = 'auth:sign-up';

  public async listener({ eventData }: IEventListenerProperties) {
    try {
      const user = UserRepository.create(eventData.payload[0]);
      const authService = Provider.ioc<IAuthService>('AuthProvider');

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
