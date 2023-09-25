import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/app/interfaces/event.interface';
import usePagination from 'Main/app/hooks/usePagination';
import PermissionRepository from 'Main/app/repositories/Permission-repository';
import ResponseContract from 'Main/app/interfaces/response-contract';

export default class PermissionShowEvent implements EventContract {
  public channel: string = 'permission:show';

  public middlewares = ['auth-middleware'];

  public async listener({ eventData }: EventListenerPropertiesContract) {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('view-permission');

      if (requesterHasPermission) {
        const payload = eventData.payload[0];
        const page = eventData.payload[1] || 1; // Page
        const take = eventData.payload[2] || 15; // Total
        const skip = (page - 1) * take;

        if (payload instanceof Object && !(payload instanceof Array)) {
          const permissionQuery = PermissionRepository.createQueryBuilder()
            .take(take)
            .skip(skip);

          // eslint-disable-next-line no-restricted-syntax
          for (const [propertyName, propertyFind] of Object.entries(payload)) {
            if (propertyFind instanceof Array) {
              permissionQuery.where(`${propertyName} IN (:...args)`, {
                args: propertyFind,
              });
            } else {
              return {
                errors: [
                  'The look-up values for the property must be in array',
                ],
                code: 'REQ_INVALID',
                status: 'ERROR',
              } as ResponseContract;
            }
          }

          // eslint-disable-next-line react-hooks/rules-of-hooks
          return await usePagination(permissionQuery, page);
        }

        return {
          errors: ['The query argument must be an Object'],
          code: 'REQ_INVALID',
          status: 'ERROR',
        } as ResponseContract;
      }

      return {
        errors: ['You are not allowed to view a Permission'],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as ResponseContract;
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        code: 'SYS_ERR',
        status: 'ERROR',
      } as ResponseContract;
    }
  }
}
