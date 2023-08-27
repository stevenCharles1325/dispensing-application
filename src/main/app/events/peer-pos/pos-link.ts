import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';

export default class PosRequestEvent implements EventContract {
  public channel: string = 'pos:link';

  public async listener({
    eventArgs,
    storage,
  }: EventListenerPropertiesContract) {
    try {
      const otherSignalData = eventArgs[0];
      const peer = storage.get('POS_PEER');

      if (!peer) {
        return {
          errors: ['Peer has not been initialized yet.'],
          status: 'ERROR',
        };
      }

      if (!otherSignalData) {
        return {
          errors: ['Please provide the branch signal data'],
          status: 'ERROR',
        };
      }

      peer.signal(JSON.parse(otherSignalData));

      return {
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
