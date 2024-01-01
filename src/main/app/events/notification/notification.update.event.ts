import NotificationDTO from 'App/data-transfer-objects/notification.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import handleError from 'App/modules/error-handler.module';
import validator from 'App/modules/validator.module';
import NotificationRepository from 'App/repositories/notification.repository';
import { Notification } from 'Main/database/models/notification.model';
import { Bull } from 'Main/jobs';

export default class NotificationUpdateEvent implements IEvent {
  public channel: string = 'notification:update';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | NotificationDTO | any>
  > {
    try {
      const { user } = eventData;
      const id = eventData.payload[0];
      const notificationStatusUpdate: NotificationDTO['status'] = eventData.payload[1];

      const requesterHasPermission = user.hasPermission?.('update-notification');

      if (requesterHasPermission) {
        const notification = await NotificationRepository.findOneByOrFail({
          id,
        });

        notification.status = notification.status === 'VISITED'
          ? notification.status
          : notificationStatusUpdate;

        const errors = await validator(notification);

        if (errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        if (notificationStatusUpdate === 'UNSEEN') {
          await Bull('AUDIT_JOB', {
            user_id: user.id as unknown as string,
            resource_id: id.toString(),
            resource_table: 'notifications',
            resource_id_type: 'uuid',
            action: 'update',
            status: 'SUCCEEDED',
            description: `User ${user.fullName} marked a notification as unread`,
          });
        }

        const data: Notification = await NotificationRepository.save(notification);

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as unknown as string,
        resource_id: id.toString(),
        resource_table: 'notifications',
        resource_id_type: 'uuid',
        action: 'update',
        status: 'FAILED',
        description: `User ${user.fullName} has failed to update a Notification`,
      });

      return {
        errors: ['You are not allowed to update a Notification'],
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
