import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import validator from 'App/modules/validator.module';
import RoleRepository from 'App/repositories/role.repository';

export default class UserDeleteEvent implements IEvent {
  public channel: string = 'role:update';

  public middlewares = ['auth.middleware'];

  public async listener({ eventData }: IEventListenerProperties) {
    try {
      const id = eventData.payload[0];
      const roleUpdate = eventData.payload[1];

      const requesterHasPermission =
        eventData.user.hasPermission?.('update-role');

      if (requesterHasPermission) {
        const role = await RoleRepository.findOneByOrFail({
          id,
        });
        const updatedRole = RoleRepository.merge(role, roleUpdate);
        const errors = await validator(updatedRole);

        if (errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as IResponse;
        }

        const data = await RoleRepository.save(updatedRole);
        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse;
      }

      return {
        errors: ['You are not allowed to update a Role'],
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
