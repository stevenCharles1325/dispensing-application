import IEvent from 'Interfaces/event/event.interface';
import IEventListenerProperties from 'Interfaces/event/event.listener-props.interface';
import IResponse from 'Interfaces/pos/pos.response.interface';
import handleError from 'Modules/error-handler.module';
import validator from 'Modules/validator.module';
import UserRepository from 'Repositories/user.repository';

export default class UserDeleteEvent implements IEvent {
  public channel: string = 'user:update';

  public middlewares = ['auth-middleware'];

  public async listener({ eventData }: IEventListenerProperties) {
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
          } as IResponse;
        }

        const data = await UserRepository.save(updatedUser);
        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse;
      }

      return {
        errors: ['You are not allowed to update a User'],
        status: 'ERROR',
      } as IResponse;
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
