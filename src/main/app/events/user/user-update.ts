import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import UserRepository from 'Main/app/repositories/User-repository';
import validator from 'Main/app/modules/validator';
import ResponseContract from 'Main/contracts/response-contract';

export default class UserDeleteEvent implements EventContract {
  public channel: string = 'user:update';

  public middlewares = ['auth-middleware'];

  public async listener({ eventData }: EventListenerPropertiesContract) {
    try {
      const id = eventData.payload[0];
      const userUpdate = eventData.payload[1];

      const requesterHasPermission =
        eventData.user.hasPermission?.('update-user');

      if (requesterHasPermission) {
        const user = await UserRepository.findOneByOrFail({
          id,
        });
        const updatedUser = UserRepository.merge(user, userUpdate);
        const errors = await validator(updatedUser);

        if (errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as ResponseContract;
        }

        const data = await UserRepository.save(updatedUser);
        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as ResponseContract;
      }

      return {
        errors: ['You are not allowed to update a User'],
        status: 'ERROR',
      } as ResponseContract;
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
