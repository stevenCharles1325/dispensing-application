/* eslint-disable no-inner-declarations */
/* eslint-disable prefer-destructuring */
import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AuthConfig from 'Main/config/auth';
import UserRepository from 'Main/app/repositories/User-repository';
import POSPeerDataContract from 'Main/contracts/pos-peer-data-contract';

export default class PosRequestEvent implements EventContract {
  public channel: string = 'pos:request';

  public async listener({
    eventArgs,
    storage,
  }: EventListenerPropertiesContract) {
    try {
      const requestData = eventArgs[0];
      const peer = storage.get('POS_PEER');

      // Sending all available connection to the other peer.
      async function verify (data: string) {
        if (!data) return;

        const parsedData: POSPeerDataContract = JSON.parse(data);

        if (parsedData.type === 'handshake:request') {
          try {
            const decoded: JwtPayload = jwt.verify(
              parsedData.authToken,
              AuthConfig.key,
              { complete: true }
            );
            console.log('DECODED: ', decoded);

            const email = decoded['email'];

            if (email) {
              const user = await UserRepository.findOneBy({ email });

              if (user) {
                const response: POSPeerDataContract = {
                  systemKey: parsedData.systemKey,
                  authToken: parsedData.authToken,
                  type: `${parsedData.type.split(':')[0]}:response`,
                  response: {
                    status: 'SUCCESS',
                  },
                };

                peer.send(JSON.stringify(response));
              } else {
                const response: POSPeerDataContract = {
                  systemKey: parsedData.systemKey,
                  authToken: parsedData.authToken,
                  type: `${parsedData.type.split(':')[0]}:response`,
                  response: {
                    errors: ['User does not exist'],
                    status: 'ERROR',
                  },
                };

                peer.send(JSON.stringify(response));
              }
            } else {
              console.log('Email is not in token');
            }
          } catch (err) {
            const errors = handleError(err);

            console.log(errors);
          }
        }
      }

      // peer.on('data', (data: string) => );

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
