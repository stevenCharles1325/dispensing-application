import UserRepository from 'Main/app/repositories/User-repository';
import handleError from 'Main/app/modules/error-handler';
import validator from 'Main/app/modules/validator';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';

export default class UserCreateEvent implements EventContract {
  public channel: string = 'user:create';

  public middlewares = ['auth-middleware'];

  public async listener({ eventData }: EventListenerPropertiesContract) {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('create-user');

      console.log('PEER HAS PERMISSION: ', requesterHasPermission);
      console.log(eventData.payload[0]);
      if (requesterHasPermission) {
        const user = UserRepository.create(eventData.payload[0]);
        const errors = await validator(user);

        console.log(errors);
        if (errors && errors.length) {
          return {
            errors,
            status: 'ERROR',
          };
        }

        const data = await UserRepository.save(user);
        console.log('CREATED A USER');
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
