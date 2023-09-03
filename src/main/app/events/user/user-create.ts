import UserRepository from 'Main/app/repositories/User-repository';
import handleError from 'Main/app/modules/error-handler';
import validator from 'Main/app/modules/validator';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import { User } from 'Main/database/models/User';

export default class UserCreateEvent implements EventContract {
  public channel: string = 'user:create';

  public middlewares = ['auth-middleware'];

  public async listener({
    eventArgs,
    storage,
  }: EventListenerPropertiesContract) {
    try {
      const authUser = storage.get('POS_AUTH_USER') as User;
      const localHasPermission = authUser?.hasPermission('create-user');
      const peerHasPermission = eventArgs?.[2]?.('create-user');

      if (localHasPermission || peerHasPermission) {
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
