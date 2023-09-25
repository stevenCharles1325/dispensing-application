import Provider from '@IOC:Provider';
import handleError from 'Main/app/modules/error-handler';
import AuthService from 'Main/app/services/auth.service';
import EventContract, {
  EventListenerPropertiesContract,
  Listener,
} from 'Main/app/interfaces/event.interface';
import POSError from 'Main/app/interfaces/pos-error-contract';
import POSValidationError from 'Main/app/interfaces/pos-validation-error-contract';
import ResponseContract from 'Main/app/interfaces/response-contract';
import { User } from 'Main/database/models/User';
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
    const authResponse = authService.verifyToken(eventData.user.token);

    if (authResponse.status === 'ERROR') {
      return {
        errors: authResponse.errors,
        code: 'PEER_SYNC_ERR',
        status: 'ERROR',
      } as ResponseContract;
    }

    const user = authResponse.data;
    const hasPermission = authService.hasPermission(
      user,
      'view-data',
      'download-data'
    );

    const syncList = {
      User,
    };

    if (hasPermission) {
      try {
        if (data.type === 'request') {
          const syncItems: Record<string, any> = {};

          // eslint-disable-next-line no-restricted-syntax
          for await (const [syncItemName, syncItemModel] of Object.entries(
            syncList
          )) {
            const item = await SqliteDataSource.getRepository(syncItemModel)
              .createQueryBuilder(syncItemName)
              .getMany();
            syncItems[syncItemName.toLowerCase()] = item;
          }

          return {
            data: syncItems,
            code: 'PEER_REQ_OK',
            status: 'SUCCESS',
          } as ResponseContract;
        }

        if (data.type === 'response') {
          const errors: POSError[] | POSValidationError[] = [];
          const responseData: any[] = [];

          // Saving response to the local database
          // eslint-disable-next-line no-restricted-syntax
          console.log(data.response);

          // eslint-disable-next-line no-restricted-syntax
          for await (const [syncItemName, syncItemModel] of Object.entries(
            syncList
          )) {
            const synchingData =
              data.response?.body?.data[syncItemName.toLowerCase()];

            // eslint-disable-next-line no-restricted-syntax
            for await (const synchingDatum of synchingData) {
              const response = await events[
                `${syncItemName.toLowerCase()}:create`
              ]({
                event,
                eventData: {
                  payload: [synchingDatum],
                  user: {
                    token: data.token,
                  },
                },
                storage,
              });

              if (response.status === 'SUCCESS') {
                responseData.push(response.data);
              } else if (response.errors) {
                errors.push(
                  ...(response.errors as POSError[] & POSValidationError[])
                );
              }
            }
          }

          return {
            data: responseData,
            errors,
            code: errors.length ? 'PEER_SYNC_ERROR' : 'PEER_SYNC_OK',
            status: errors.length ? 'ERROR' : 'SUCCESS',
          } as ResponseContract;
        }

        return {
          errors: ['Request is invalid'],
          code: 'PEER_REQ_INVALID',
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
    } else {
      return {
        errors: ['Unauthorized user'],
        code: 'PEER_SYNC_ERR',
        status: 'ERROR',
      } as ResponseContract;
    }
  }
}
