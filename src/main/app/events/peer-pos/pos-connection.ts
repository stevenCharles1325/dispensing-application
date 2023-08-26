import axios from 'axios';
import Peer from 'simple-peer';
import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import { ipcMain } from 'electron';

const wrtc = require('wrtc');

export default class PosConnectionEvent implements EventContract {
  public channel: string = 'pos:connection';

  public async listener({ storage }: EventListenerPropertiesContract) {
    try {
      const TURN_URL = new URL(
        `https://${process.env.TURN_SERVER_DOMAIN}/api/v1/turn/credentials`
      );

      TURN_URL.searchParams.set(
        'apiKey',
        process.env.TURN_SERVER_SECRET_KEY ?? ''
      );

      const data = await axios
        .get(TURN_URL.toString())
        .then((response: any) => {
          return response.data;
        })
        .catch((error: any) => {
          console.log(error);
        });

      const peer = new Peer({
        initiator: Boolean(process.env.PEER_INITIATOR ?? 0),
        config: { iceServers: data },
        trickle: false,
        wrtc,
      });

      storage.set('POS_PEER', peer);

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
