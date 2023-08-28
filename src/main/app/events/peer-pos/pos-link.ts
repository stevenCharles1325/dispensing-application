import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';

export default class PosLinkEvent implements EventContract {
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

      const otherPeersSignalData = storage.get('POS_PEER_OTHER_DATA');
      storage.set('POS_PEER_OTHERS_DATA', [
        ...(otherPeersSignalData ?? []),
        otherSignalData,
      ]);
      peer.signal(JSON.parse(otherSignalData));

      peer.on('error', (err: any) => {
        const error = handleError(err);

        console.log(error);
      });

      peer.on('connection', () => {
        // Sending all available connection to the other peer.
        peer.send(JSON.stringify(otherPeersSignalData));
      });

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
