import UserRepository from 'Main/app/repositories/User-repository';
import handleError from 'Main/app/modules/error-handler';
import validator from 'Main/app/modules/validator';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';

export default class UserShowEvent implements EventContract {
  public channel: string = 'user:show';

  public middlewares = ['auth-middleware'];

  public async listener({ eventData }: EventListenerPropertiesContract) {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('view-user');

      if (requesterHasPermission) {
        const payload = eventData.payload[0];
        const page = eventData.payload[1] ?? 1; // Page
        const take = eventData.payload[2] ?? 15; // Total
        const skip = page * take;

        console.log(payload);
        if (payload instanceof Object && !(payload instanceof Array)) {
          const userQuery = UserRepository.createQueryBuilder()
            .take(take)
            .skip(skip);

          // eslint-disable-next-line no-restricted-syntax
          for (const [propertyName, propertyFind] of Object.entries(payload)) {
            if (propertyFind instanceof Array) {
              userQuery.where(`:userProperty IN (:...args)`, {
                userProperty: propertyName,
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

          const users = await userQuery.getMany();
          return {
            data: users,
            status: 'SUCCESS',
          };
        }

        return {
          errors: ['The query argument must be an Object'],
          status: 'ERROR',
        };
      }

      return {
        errors: ['You are not allowed to create a User'],
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
