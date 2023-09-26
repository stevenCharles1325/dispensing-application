import IEvent from 'Interfaces/event/event.interface';
import IEventListenerProperties from 'Interfaces/event/event.listener-props.interface';
import IListener from 'Interfaces/event/event.listener.interface';
import IResponse from 'Interfaces/pos/pos.response.interface';
import handleError from 'Modules/error-handler.module';

export default class PeerRequestEvent implements IEvent {
  public channel: string = 'peer:request';

  public async listener({
    event,
    eventData,
    storage,
  }: IEventListenerProperties) {
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
        } as IResponse;
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
        } as IResponse;
      }

      if (data.systemKey !== process.env.SYSTEM_KEY)
        return {
          errors: ['Invalid system-key'],
          code: 'PEER_REQ_ERR',
          status: 'ERROR',
        } as IResponse;

      if (!data.request?.name)
        return {
          errors: ['Request name is required'],
          code: 'PEER_REQ_ERR',
          status: 'ERROR',
        } as IResponse;

      if (unavailableEvents.includes(data.request.name)) {
        return {
          errors: ['Invalid action'],
          code: 'PEER_REQ_INVALID',
          status: 'ERROR',
        } as IResponse;
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
      } as IResponse;
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        code: 'PEER_REQ_ERR',
        status: 'ERROR',
      } as IResponse;
    }
  }
}
