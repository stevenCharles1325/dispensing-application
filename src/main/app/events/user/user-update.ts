import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import UserRepository from 'Main/app/repositories/User-repository';
import validator from 'Main/app/modules/validator';
import { User } from 'Main/database/models/User';

export default class UserDeleteEvent implements EventContract {
  public channel: string = 'user:update';

  public async listener({
    eventArgs,
    storage,
  }: EventListenerPropertiesContract) {
    try {
      const authUser = storage.get('POS_AUTH_USER') as User;
      const hasPermission = authUser.hasPermission('update-user');

      if (hasPermission) {
        const user = await UserRepository.findOneByOrFail({ id: eventArgs[0] });
        const updatedUser = UserRepository.merge(user, eventArgs[1]);
        const errors = await validator(updatedUser);

        if (errors.length) {
          return {
            errors,
            status: 'ERROR',
          };
        }

        const data = await UserRepository.save(updatedUser);
        return {
          data,
          errors: [],
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
