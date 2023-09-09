import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import usePagination from 'Main/app/hooks/usePagination';
import RoleRepository from 'Main/app/repositories/Role-repository';

export default class RoleShowEvent implements EventContract {
  public channel: string = 'role:show';

  public middlewares = ['auth-middleware'];

  public async listener({ eventData }: EventListenerPropertiesContract) {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('view-role');

      if (requesterHasPermission) {
        const payload = eventData.payload[0];
        const page = eventData.payload[1] || 1; // Page
        const take = eventData.payload[2] || 15; // Total
        const skip = (page - 1) * take;

        if (payload instanceof Object && !(payload instanceof Array)) {
          const roleQuery = RoleRepository.createQueryBuilder()
            .take(take)
            .skip(skip);

          // eslint-disable-next-line no-restricted-syntax
          for (const [propertyName, propertyFind] of Object.entries(payload)) {
            if (propertyFind instanceof Array) {
              roleQuery.where(`${propertyName} IN (:...args)`, {
                args: propertyFind,
              });
            } else {
              return {
                errors: [
                  'The look-up values for the property must be in array',
                ],
                status: 'ERROR',
              };
            }
          }

          // eslint-disable-next-line react-hooks/rules-of-hooks
          return await usePagination(roleQuery, page);
        }

        return {
          errors: ['The query argument must be an Object'],
          status: 'ERROR',
        };
      }

      return {
        errors: ['You are not allowed to view a Role'],
        status: 'ERROR',
      };
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        status: 'ERROR',
      };
    }
  }
}
