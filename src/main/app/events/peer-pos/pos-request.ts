import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';

export default class PosRequestEvent implements EventContract {
  public channel: string = 'pos:request';

  public async listener({
    eventArgs,
    storage,
  }: EventListenerPropertiesContract) {
    try {
      const requestedEventName = eventArgs[0];
      const peer = storage.get('POS_PEER');

      /*
        Initialize listeners for other peer requests
        DATA STRUCTURE:
         {
            userName: <User name from other peer DB>
            eventName: <The event wanted to be emitted>
         }
      */
      // peer.on('signal', (data) => {
      // });

      peer.signal(requestedEventName);
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
