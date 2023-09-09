import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import { SqliteDataSource } from 'Main/datasource';
import { Role } from 'Main/database/models/Role';

export default class RoleDeleteEvent implements EventContract {
  public channel: string = 'role:delete';

  public middlewares = ['auth-middleware'];

  public async listener({ eventData }: EventListenerPropertiesContract) {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('delete-role');

      if (requesterHasPermission) {
        const roleRepo = SqliteDataSource.getRepository(Role);
        const data = await roleRepo.delete(eventData.payload[0]);

        return {
          data,
          errors: [],
          status: 'SUCCESS',
        };
      }

      return {
        errors: ['You are not allowed to delete a Role'],
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
