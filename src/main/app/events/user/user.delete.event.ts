/* eslint-disable no-restricted-syntax */
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import { User } from 'Main/database/models/user.model';
import { SqliteDataSource } from 'Main/datasource';
import { Bull } from 'Main/jobs';

export default class UserDeleteEvent implements IEvent {
  public channel: string = 'user:delete';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | any>
  > {
    try {
      const { user } = eventData;
      const payload: User['id'] = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.('delete-user');

      if (requesterHasPermission) {
        const userRepo = SqliteDataSource.getRepository(User);
        const data = await userRepo.delete(payload);

        if (Array.isArray(payload)) {
          for await (const id of payload) {
            await Bull('AUDIT_JOB', {
              user_id: user.id as number,
              resource_id: id.toString(),
              resource_table: 'users',
              resource_id_type: 'integer',
              action: 'delete',
              status: 'SUCCEEDED',
              description: `User ${user.fullName} has successfully deleted a User`,
            });
          }
        } else {
          await Bull('AUDIT_JOB', {
            user_id: user.id as number,
            resource_id: payload.toString(),
            resource_table: 'users',
            resource_id_type: 'integer',
            action: 'delete',
            status: 'SUCCEEDED',
            description: `User ${user.fullName} has successfully deleted a User`,
          });
        }

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_table: 'users',
        action: 'delete',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to delete a User`,
      });

      return {
        errors: ['You are not allowed to delete a User'],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as unknown as IResponse<string[]>;
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      if (error?.code === 19) {
        return {
          errors: ['cannot delete a user that has logs'],
          code: 'SYS_ERR',
          status: 'ERROR',
        } as unknown as IResponse<IPOSError[]>;
      }

      return {
        errors: [error],
        code: 'SYS_ERR',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
