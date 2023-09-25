import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/app/interfaces/event.interface';
import validator from 'Main/app/modules/validator.module';
import RoleRepository from 'Main/app/repositories/Role-repository';
import ResponseContract from 'Main/app/interfaces/response-contract';

export default class UserDeleteEvent implements EventContract {
  public channel: string = 'role:update';

  public middlewares = ['auth-middleware'];

  public async listener({ eventData }: EventListenerPropertiesContract) {
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
          } as ResponseContract;
        }

        const data = await RoleRepository.save(updatedRole);
        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as ResponseContract;
      }

      return {
        errors: ['You are not allowed to update a Role'],
        code: 'REQ_UNAUTH',
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
