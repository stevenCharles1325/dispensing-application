/* eslint-disable no-restricted-syntax */
import NotificationDTO from 'App/data-transfer-objects/notification.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import { Notification } from 'Main/database/models/notification.model';
import { SqliteDataSource } from 'Main/datasource';
import { Bull } from 'Main/jobs';

export default class NotificationDeleteEvent implements IEvent {
  public channel: string = 'notification:delete';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | any>
  > {
    try {
      const { user } = eventData;
      const payload: NotificationDTO['id'] = eventData.payload[0];
      const requesterHasPermission =
        eventData.user.hasPermission?.('delete-notification');

      if (requesterHasPermission) {
        const notificationRepo = SqliteDataSource.getRepository(Notification);
        const data = await notificationRepo.delete(payload);

        if (Array.isArray(payload)) {
          for await (const id of payload) {
            await Bull('AUDIT_JOB', {
              user_id: user.id as unknown as string,
              resource_id: id.toString(),
              resource_table: 'notifications',
              resource_id_type: 'uuid',
              action: 'delete',
              status: 'SUCCEEDED',
              description: `User ${user.fullName} has successfully deleted a Notification`,
            });
          }
        } else {
          await Bull('AUDIT_JOB', {
            user_id: user.id as unknown as string,
            resource_id: payload.toString(),
            resource_table: 'notifications',
            resource_id_type: 'uuid',
            action: 'delete',
            status: 'SUCCEEDED',
            description: `User ${user.fullName} has successfully deleted a Notification`,
          });
        }

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as unknown as string,
        resource_table: 'notifications',
        action: 'delete',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to delete a Notification`,
      });

      return {
        errors: ['You are not allowed to delete a Notification'],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as unknown as IResponse<string[]>;
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        code: 'SYS_ERR',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
