import UserRepository from 'Main/app/repositories/User-repository';
import handleError from 'Main/app/modules/error-handler';
import validator from 'Main/app/modules/validator';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import { User } from 'Main/database/models/User';

export default class UserCreateEvent implements EventContract {
  public channel: string = 'user:create';

  public async listener({
    eventArgs,
    storage,
  }: EventListenerPropertiesContract) {
    try {
      // const authUser = Provider.ioc<AuthService>('AuthProvider').getAuthUser();
      const authUser = storage.get('POS_AUTH_USER') as User;
      const hasPermission = authUser.hasPermission('create-user');

      if (hasPermission) {
        const user = UserRepository.create(eventArgs[0]);
        const errors = await validator(user);
        if (errors && errors.length) {
          return {
            errors,
            status: 'ERROR',
          };
        }

        const data = await UserRepository.save(user);
        return {
          data,
          status: 'SUCCESS',
        };
      }

      return {
        errors: ['You are not allowed to create a User'],
        status: 'ERROR',
      };
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
