import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import { Role } from 'Main/database/models/role.model';
import { SqliteDataSource } from 'Main/datasource';

export default class RoleDeleteEvent implements IEvent {
  public channel: string = 'role:delete';

  public middlewares = ['auth.middleware'];

  public async listener({ eventData }: IEventListenerProperties) {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('delete-role');

      if (requesterHasPermission) {
        const roleRepo = SqliteDataSource.getRepository(Role);
        const data = await roleRepo.delete(eventData.payload[0]);

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse;
      }

      return {
        errors: ['You are not allowed to delete a Role'],
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
