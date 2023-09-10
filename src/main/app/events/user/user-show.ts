import UserRepository from 'Main/app/repositories/User-repository';
import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import usePagination from 'Main/app/hooks/usePagination';
import ResponseContract from 'Main/contracts/response-contract';

export default class UserShowEvent implements EventContract {
  public channel: string = 'user:show';

  public middlewares = ['auth-middleware'];

  public async listener({ eventData }: EventListenerPropertiesContract) {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('view-user');

      if (requesterHasPermission) {
        const payload = eventData.payload[0];
        const page = eventData.payload[1] || 1; // Page
        const take = eventData.payload[2] || 15; // Total
        const skip = (page - 1) * take;

        if (payload instanceof Object && !(payload instanceof Array)) {
          const userQuery = UserRepository.createQueryBuilder()
            .take(take)
            .skip(skip);

          // eslint-disable-next-line no-restricted-syntax
          for (const [propertyName, propertyFind] of Object.entries(payload)) {
            if (propertyFind instanceof Array) {
              userQuery.where(`${propertyName} IN (:...args)`, {
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
          return await usePagination(userQuery, page);
        }

        return {
          errors: ['The query argument must be an Object'],
          code: 'REQ_INVALID',
          status: 'ERROR',
        } as ResponseContract;
      }

      return {
        errors: ['You are not allowed to view a User'],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as ResponseContract;
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as ResponseContract;
    }
  }
}
