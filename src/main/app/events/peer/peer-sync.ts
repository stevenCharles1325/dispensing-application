import Provider from '@IOC:Provider';
import handleError from 'Main/app/modules/error-handler';
import AuthService from 'Main/app/services/AuthService';
import EventContract, {
  EventListenerPropertiesContract,
  Listener,
} from 'Main/contracts/event-contract';
import POSError from 'Main/contracts/pos-error-contract';
import POSValidationError from 'Main/contracts/pos-validation-error-contract';
import { SqliteDataSource } from 'Main/datasource';

export default class PeerSyncEvent implements EventContract {
  public channel: string = 'peer:sync';

  public async listener({
    event,
    eventData,
    storage,
  }: EventListenerPropertiesContract) {
    // eslint-disable-next-line no-undef
    const data: PeerDataContract = eventData.payload[0];
    const authService = Provider.ioc<AuthService>('AuthProvider');
    const events: Record<string, Listener> = storage.get('POS_EVENTS');

    // Mannually verifies the token
    const authResponse = authService.verifyToken(data.token);

    if (authResponse.status === 'ERROR') {
      return {
        errors: authResponse.errors,
        status: 'ERROR',
      };
    }

    const user = authResponse.data;
    const hasPermission = authService.hasPermission(
      user,
      'view-data',
      'download-data'
    );

    const syncList = [
      'User',
      // Add more model names in singular form here...
    ].map((tableName: string) => tableName.toLowerCase());

    if (hasPermission) {
      try {
        if (data.type === 'request') {
          const syncItems: Record<string, any> = {};

          // eslint-disable-next-line no-restricted-syntax
          for await (const syncItemName of syncList) {
            const item = await SqliteDataSource.getRepository(syncItemName)
              .createQueryBuilder(syncItemName)
              .getMany();
            syncItems[syncItemName] = item;
          }

          return {
            data: syncItems,
            status: 'SUCCESS',
          };
        }

        if (data.type === 'response') {
          const errors: POSError[] | POSValidationError[] = [];
          const responseData: any[] = [];

          // Saving response to the local database
          // eslint-disable-next-line no-restricted-syntax
          for await (const syncItemName of syncList) {
            const response = await events[`${syncItemName}:create`]({
              event,
              eventData: {
                payload: [data.response?.body?.data[syncItemName]],
                user: {
                  token: data.token,
                },
              },
              storage,
            });

            if (response.status === 'SUCCESS') {
              responseData.push(response.data);
            } else {
              errors.push(...response.errors);
            }
          }

          return {
            data: responseData,
            errors,
            status: errors.length ? 'ERROR' : 'SUCCESS',
          };
        }

        return {
          errors: ['Request is invalid'],
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
    } else {
      return {
        errors: ['Unauthorized user'],
        status: 'ERROR',
      };
    }
  }
}
