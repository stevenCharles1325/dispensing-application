import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import { User } from 'Main/database/models/user.model';
import { SqliteDataSource } from 'Main/datasource';

export default class UserArchiveEvent implements IEvent {
  public channel: string = 'user:archive';

  public middlewares = ['auth.middleware'];

  public async listener({ eventData }: IEventListenerProperties) {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('archive-user');

      if (requesterHasPermission) {
        const userRepo = SqliteDataSource.getRepository(User);
        const data = await userRepo.softDelete(eventData.payload[0]);

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse;
      }

      return {
        errors: ['You are not allowed to archive a User'],
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
