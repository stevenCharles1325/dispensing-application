import handleError from 'Main/app/modules/error-handler';
import validator from 'Main/app/modules/validator';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import RoleRepository from 'Main/app/repositories/Role-repository';

export default class RoleCreateEvent implements EventContract {
  public channel: string = 'role:create';

  public middlewares = ['auth-middleware'];

  public async listener({ eventData }: EventListenerPropertiesContract) {
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
            status: 'ERROR',
          };
        }

        const data = await RoleRepository.save(role);
        console.log('CREATED A ROLE');
        return {
          data,
          status: 'SUCCESS',
        };
      }

      return {
        errors: ['You are not allowed to create a Role'],
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
