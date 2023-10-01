import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IListener from 'App/interfaces/event/event.listener.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import handleError from 'App/modules/error-handler.module';

export default class PeerRequestEvent implements IEvent {
  public channel: string = 'peer:request';

  public async listener({
    event,
    eventData,
    storage,
  }: IEventListenerProperties): Promise<
    IResponse<
      | string[]
      | IPOSError
      | IPOSValidationError
      // eslint-disable-next-line no-undef
      | PeerDataContract
      | any
    >
  > {
    try {
      // eslint-disable-next-line no-undef
      const data: PeerDataContract = eventData.payload[0];
      const events: Record<string, IListener> = storage.get('POS_EVENTS');
      const desiredEvent =
        events?.[data.response?.name ?? data.request?.name ?? ''];

      if (!desiredEvent) {
        return {
          errors: ['Event is not available'],
          code: 'PEER_REQ_INVALID',
          status: 'ERROR',
        } as unknown as IResponse<string[]>;
      }

      const unavailableEvents = [
        'auth:sign-in',
        'auth:sign-up',
        'auth:sign-out',
        // Add events that are not available
      ];

      if (data.type === 'response') {
        const response = await desiredEvent({
          event,
          eventData: {
            payload: [
              data.response!.name === 'peer:sync' ? data : data.response!.body,
            ],
            user: {
              token: data.token,
            },
          },
          storage,
        });

        return {
          data: response,
          code: 'PEER_REQ_OK',
          status: 'SUCCESS',
        } as IResponse<any>;
      }

      if (data.systemKey !== process.env.SYSTEM_KEY)
        return {
          errors: ['Invalid system-key'],
          code: 'PEER_REQ_ERR',
          status: 'ERROR',
        } as unknown as IResponse<string[]>;

      if (!data.request?.name)
        return {
          errors: ['Request name is required'],
          code: 'PEER_REQ_ERR',
          status: 'ERROR',
        } as unknown as IResponse<string[]>;

      if (unavailableEvents.includes(data.request.name)) {
        return {
          errors: ['Invalid action'],
          code: 'PEER_REQ_INVALID',
          status: 'ERROR',
        } as unknown as IResponse<string[]>;
      }

      const response = await desiredEvent({
        event,
        eventData: {
          payload: [
            data.request.name === 'peer:sync' ? data : data.request.body,
          ],
          user: {
            token: data.token,
          },
        },
        storage,
      });

      const payload = {
        systemKey: process.env.SYSTEM_KEY,
        token: data.token,
        type: 'response',
        response: {
          name: data.request.name,
          body: response,
        },
        // eslint-disable-next-line no-undef
      } as PeerDataContract;

      return {
        data: payload,
        code: 'PEER_REQ_OK',
        status: 'SUCCESS',
        // eslint-disable-next-line no-undef
      } as IResponse<PeerDataContract>;
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        code: 'PEER_REQ_ERR',
        status: 'ERROR',
      } as IResponse<typeof error>;
    }
  }
}
