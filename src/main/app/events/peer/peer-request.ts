import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
  Listener,
} from 'Main/contracts/event-contract';
import ResponseContract from 'Main/contracts/response-contract';

export default class PeerRequestEvent implements EventContract {
  public channel: string = 'peer:request';

  public async listener({
    event,
    eventData,
    storage,
  }: EventListenerPropertiesContract) {
    try {
      // eslint-disable-next-line no-undef
      const data: PeerDataContract = eventData.payload[0];
      const events: Record<string, Listener> = storage.get('POS_EVENTS');
      const desiredEvent =
        events?.[data.response?.name ?? data.request?.name ?? ''];

      if (!desiredEvent) {
        return {
          errors: ['Event is not available'],
          code: 'PEER_REQ_INVALID',
          status: 'ERROR',
        } as ResponseContract;
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
        } as ResponseContract;
      }

      if (data.systemKey !== process.env.SYSTEM_KEY)
        return {
          errors: ['Invalid system-key'],
          code: 'PEER_REQ_ERR',
          status: 'ERROR',
        } as ResponseContract;

      if (!data.request?.name)
        return {
          errors: ['Request name is required'],
          code: 'PEER_REQ_ERR',
          status: 'ERROR',
        } as ResponseContract;

      if (unavailableEvents.includes(data.request.name)) {
        return {
          errors: ['Invalid action'],
          code: 'PEER_REQ_INVALID',
          status: 'ERROR',
        } as ResponseContract;
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
      } as ResponseContract;
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        code: 'PEER_REQ_ERR',
        status: 'ERROR',
      } as ResponseContract;
    }
  }
}
