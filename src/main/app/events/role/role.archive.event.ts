import IEvent from 'Interfaces/event/event.interface';
import IEventListenerProperties from 'Interfaces/event/event.listener-props.interface';
import IResponse from 'Interfaces/pos/pos.response.interface';
import { SqliteDataSource } from 'Main/datasource';
import { Role } from 'Models/role.model';
import handleError from 'Modules/error-handler.module';

export default class RoleArchiveEvent implements IEvent {
  public channel: string = 'role:archive';

  public middlewares = ['auth-middleware'];

  public async listener({ eventData }: IEventListenerProperties) {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('archive-role');

      if (requesterHasPermission) {
        const roleRepo = SqliteDataSource.getRepository(Role);
        const data = await roleRepo.softDelete(eventData.payload[0]);

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse;
      }

      return {
        errors: ['You are not allowed to archive a Role'],
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
