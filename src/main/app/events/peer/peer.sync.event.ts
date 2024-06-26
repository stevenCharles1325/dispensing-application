import Provider from '@IOC:Provider';
import UserDTO from 'App/data-transfer-objects/user.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IListener from 'App/interfaces/event/event.listener.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import handleError from 'App/modules/error-handler.module';
import { User } from 'Main/database/models/user.model';
import { SqliteDataSource } from 'Main/datasource';

export default class PeerSyncEvent implements IEvent {
  public channel: string = 'peer:sync';

  public async listener({
    event,
    eventData,
    localStorage,
    globalStorage,
  }: IEventListenerProperties): Promise<
    IResponse<Partial<UserDTO> | IPOSError[] | any>
  > {
    // eslint-disable-next-line no-undef
    const data: PeerDataContract = eventData.payload[0];
    const authService = Provider.ioc<IAuthService>('AuthProvider');
    const events: Record<string, IListener> = localStorage.get('POS_EVENTS');

    // Mannually verifies the token
    const authResponse = authService.verifyToken(eventData.user.token);

    if (authResponse.status === 'ERROR') {
      return {
        errors: authResponse.errors,
        code: 'PEER_SYNC_ERR',
        status: 'ERROR',
      } as IResponse<IPOSError[]>;
    }

    const user = authResponse.data as Partial<UserDTO>;
    const hasPermission = authService.hasPermission(
      user,
      'view-data',
      'create-data',
      'update-data',
      'delete-data',
      'download-data',
      'request-data'
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
          } as IResponse<Record<string, any>>;
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
              data.response?.body?.data?.[syncItemName.toLowerCase()];

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
                localStorage,
                globalStorage,
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
          } as unknown as IResponse<IPOSError[] | any[]>;
        }

        return {
          errors: ['Request is invalid'],
          code: 'PEER_REQ_INVALID',
          status: 'ERROR',
        } as unknown as IResponse<string[]>;
      } catch (err) {
        const error = handleError(err);
        console.log('ERROR HANDLER OUTPUT: ', error);

        return {
          errors: [error],
          code: 'SYS_ERR',
          status: 'ERROR',
        } as unknown as IResponse<string[]>;
      }
    } else {
      return {
        errors: ['Unauthorized user'],
        code: 'PEER_SYNC_ERR',
        status: 'ERROR',
      } as unknown as IResponse<string[]>;
    }
  }
}
