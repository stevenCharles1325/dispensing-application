/* eslint-disable no-continue */
/* eslint-disable react-hooks/rules-of-hooks */
import PermissionDTO from 'App/data-transfer-objects/permission.dto';
import usePagination from 'App/hooks/pagination.hook';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import handleError from 'App/modules/error-handler.module';
import PermissionRepository from 'App/repositories/permission.repository';

export default class PermissionShowEvent implements IEvent {
  public channel: string = 'permission:show';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPagination<PermissionDTO> | IPOSError[] | any>
  > {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('view-permission');

      if (requesterHasPermission) {
        const payload = eventData.payload[0] ?? 'all';
        const page = eventData.payload[1] || 1; // Page
        const take = eventData.payload[2] || 15; // Total
        const skip = (page - 1) * take;

        const permissionQuery = PermissionRepository.createQueryBuilder()
          .take(take)
          .skip(skip);

        if (payload === 'all') {
          return await usePagination(permissionQuery, page);
        }

        if (payload instanceof Object && !(payload instanceof Array)) {
          // eslint-disable-next-line no-restricted-syntax
          for (const [propertyName, propertyFind] of Object.entries(payload)) {
            if (!(propertyFind as any)?.length) continue;

            if (propertyFind instanceof Array) {
              permissionQuery.where(`${propertyName} IN (:...args)`, {
                args: propertyFind,
              });
            } else {
              permissionQuery
                .where(`${propertyName} LIKE :${propertyName}`)
                .setParameter(propertyName, `%${propertyFind}%`);
            }
          }

          return await usePagination<PermissionDTO>(permissionQuery, page);
        }

        return {
          errors: ['The query argument must be an Object'],
          code: 'REQ_INVALID',
          status: 'ERROR',
        } as unknown as IResponse<string[]>;
      }

      return {
        errors: ['You are not allowed to view a Permission'],
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
