import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
  Listener,
} from 'Main/contracts/event-contract';

export default class PeerRequestEvent implements EventContract {
  public channel: string = 'peer:request';

  public async listener({
    event,
    eventArgs,
    storage,
  }: EventListenerPropertiesContract) {
    try {
      console.log('HEREE 1');

      // eslint-disable-next-line no-undef
      const data: PeerDataContract = eventArgs[0];
      const peer: any = eventArgs[1];
      const events: Record<string, Listener> = storage.get('POS_EVENTS');

      const availableEvents = [
        'peer:request',
        'auth:sign-in',
        'auth:sign-up',
        'auth:sign-out',
      ];

      if (data.type === 'response') return null;
      if (!data.request?.name)
        return {
          errors: ['You must provide request name if this is a Request type'],
          status: 'ERROR',
        };

      if (availableEvents.includes(data.request.name)) {
        return {
          errors: ['You are not allowed to perform this action'],
          status: 'ERROR',
        };
      }

      const response = await events[data.request.name]({
        event,
        eventArgs: [data.request.body],
        storage,
      });

      console.log(response);
      const payload = {
        systemKey: data.systemKey,
        type: 'response',
        response,
        // eslint-disable-next-line no-undef
      } as PeerDataContract;
      peer.send(payload);

      return {
        data: payload,
        errors: response.errors,
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
