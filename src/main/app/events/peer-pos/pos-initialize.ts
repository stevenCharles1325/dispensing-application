import Peer from 'simple-peer';
import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';

const wrtc = require('wrtc');

/*
  PEER-TO-PEER Connection
    - We are using P2P connection without signaling server
      therefore we need to manually set the SDP (Session Description Protocol)
      to exchange data directly.
*/

export default class PosConnectionEvent implements EventContract {
  public channel: string = 'pos:initialize';

  public async listener({ storage }: EventListenerPropertiesContract) {
    try {
      // const TURN_URL = new URL(
      //   `https://${process.env.TURN_SERVER_DOMAIN}/api/v1/turn/credentials`
      // );

      // TURN_URL.searchParams.set(
      //   'apiKey',
      //   process.env.TURN_SERVER_SECRET_KEY ?? ''
      // );

      // const data = await axios
      //   .get(TURN_URL.toString())
      //   .then((response: any) => {
      //     return response.data;
      //   })
      //   .catch((error: any) => {
      //     console.log(error);
      //   });

      const peer = new Peer({
        initiator: Boolean(process.env.PEER_INITIATOR ?? 0),
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
        trickle: false,
        wrtc,
      });

      storage.set('POS_PEER', peer);

      // Saving own data to storage for displaying
      peer.on('signal', (data) => {
        const signalData = JSON.stringify(data);
        console.log(data);

        storage.set('POS_PEER_MAIN_DATA', signalData);
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
