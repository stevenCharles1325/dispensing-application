import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import UserRepository from 'Main/app/repositories/User-repository';
import validator from 'Main/app/modules/validator';

export default class UserDeleteEvent implements EventContract {
  public channel: string = 'user:update';

  public async listener({ eventArgs }: EventListenerPropertiesContract) {
    try {
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
