import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
  Listener,
} from 'Main/contracts/event-contract';

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

      const unavailableEvents = [
        'auth:sign-in',
        'auth:sign-up',
        'auth:sign-out',
        // Add events that are not available
      ];

      if (data.type === 'response') {
        const response = await events[data.response!.name]({
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
          status: 'SUCCESS',
        };
      }

      if (data.systemKey !== process.env.SYSTEM_KEY)
        return {
          errors: ['Invalid system-key'],
          status: 'ERROR',
        };

      if (!data.request?.name)
        return {
          errors: ['You must provide request name if this is a Request type'],
          status: 'ERROR',
        };

      if (unavailableEvents.includes(data.request.name)) {
        return {
          errors: ['You are not allowed to perform this action'],
          status: 'ERROR',
        };
      }

      const response = await events[data.request.name]({
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
        status: 'SUCCESS',
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
