import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import validator from 'Main/app/modules/validator';
import RoleRepository from 'Main/app/repositories/Role-repository';

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
            status: 'ERROR',
          };
        }

        const data = await RoleRepository.save(updatedRole);
        return {
          data,
          errors: [],
          status: 'SUCCESS',
        };
      }

      return {
        errors: ['You are not allowed to update a Role'],
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
