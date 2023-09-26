import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import RoleRepository from 'App/repositories/role.repository';
import validator from 'App/modules/validator.module';

export default class RoleCreateEvent implements IEvent {
  public channel: string = 'role:create';

  public middlewares = ['auth.middleware'];

  public async listener({ eventData }: IEventListenerProperties) {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('create-role');

      if (requesterHasPermission) {
        const role = RoleRepository.create(eventData.payload[0]);
        const errors = await validator(role);

        console.log(errors);
        if (errors && errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as IResponse;
        }

        const data = await RoleRepository.save(role);
        console.log('CREATED A ROLE');
        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse;
      }

      return {
        errors: ['You are not allowed to create a Role'],
        code: 'REQ_UNAUTH',
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
