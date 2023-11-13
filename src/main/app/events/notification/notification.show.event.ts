/* eslint-disable no-continue */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-else-return */
import NotificationDTO from 'App/data-transfer-objects/notification.dto';
import usePagination from 'App/hooks/pagination.hook';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import NotificationRepository from 'App/repositories/notification.repository';

export default class NotificationShowEvent implements IEvent {
  public channel: string = 'notification:show';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IPagination<NotificationDTO> | any>
  > {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('view-notification');

      if (requesterHasPermission) {
        const payload = eventData.payload[0] ?? 'all';
        const page = eventData.payload[1] || 1; // Page
        const take = eventData.payload[2] || 15; // Total
        const skip = (page - 1) * take;

        const notificationQuery = NotificationRepository.createQueryBuilder(
          'notification'
        );

        if (take !== 'max') {
          notificationQuery.take(take).skip(skip);
        }

        if (payload === 'all') {
          return await usePagination(notificationQuery, page, take, {
            fieldName: 'created_at',
            order: 'DESC',
          });
        }

        if (payload instanceof Object && !(payload instanceof Array)) {
          // eslint-disable-next-line no-restricted-syntax
          for (const [propertyName, propertyFind] of Object.entries(payload)) {
            if (!(propertyFind as any)?.length) continue;

            if (propertyFind instanceof Array) {
              notificationQuery
                .where(`notification.${propertyName} IN (:...${propertyName})`)
                .setParameter(propertyName, propertyFind);
            } else {
              notificationQuery
                .where(`notification.${propertyName} LIKE :${propertyName}`)
                .setParameter(propertyName, `%${propertyFind}%`);
            }
          }

          return await usePagination(notificationQuery, page, take, {
            fieldName: 'created_at',
            order: 'DESC',
          });
        }

        return {
          errors: ['The query argument must be an Object'],
          code: 'REQ_INVALID',
          status: 'ERROR',
        } as unknown as IResponse<string[]>;
      }

      return {
        errors: ['You are not allowed to view a notification'],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as unknown as IResponse<string[]>;
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
