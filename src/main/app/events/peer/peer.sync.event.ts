import Provider from '@IOC:Provider';
import IEvent from 'Interfaces/event/event.interface';
import IEventListenerProperties from 'Interfaces/event/event.listener-props.interface';
import IListener from 'Interfaces/event/event.listener.interface';
import IPOSError from 'Interfaces/pos/pos.error.interface';
import IResponse from 'Interfaces/pos/pos.response.interface';
import IPOSValidationError from 'Interfaces/pos/pos.validation-error.interface';
import { SqliteDataSource } from 'Main/datasource';
import { User } from 'Models/user.model';
import handleError from 'Modules/error-handler.module';
import AuthService from 'Services/auth.service';

export default class PeerSyncEvent implements IEvent {
  public channel: string = 'peer:sync';

  public async listener({
    event,
    eventData,
    storage,
  }: IEventListenerProperties) {
    // eslint-disable-next-line no-undef
    const data: PeerDataContract = eventData.payload[0];
    const authService = Provider.ioc<AuthService>('AuthProvider');
    const events: Record<string, IListener> = storage.get('POS_EVENTS');

    // Mannually verifies the token
    const authResponse = authService.verifyToken(eventData.user.token);

    if (authResponse.status === 'ERROR') {
      return {
        errors: authResponse.errors,
        code: 'PEER_SYNC_ERR',
        status: 'ERROR',
      } as IResponse;
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
          } as IResponse;
        }

        if (data.type === 'response') {
          const errors: IPOSError[] | IPOSValidationError[] = [];
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
                  ...(response.errors as IPOSError[] & IPOSValidationError[])
                );
              }
            }
          }

          return {
            data: responseData,
            errors,
            code: errors.length ? 'PEER_SYNC_ERROR' : 'PEER_SYNC_OK',
            status: errors.length ? 'ERROR' : 'SUCCESS',
          } as IResponse;
        }

        return {
          errors: ['Request is invalid'],
          code: 'PEER_REQ_INVALID',
          status: 'ERROR',
        } as IResponse;
      } catch (err) {
        const error = handleError(err);
        console.log('ERROR HANDLER OUTPUT: ', error);

        return {
          errors: [error],
          code: 'SYS_ERR',
          status: 'ERROR',
        } as IResponse;
      }
    } else {
      return {
        errors: ['Unauthorized user'],
        code: 'PEER_SYNC_ERR',
        status: 'ERROR',
      } as IResponse;
    }
  }
}
