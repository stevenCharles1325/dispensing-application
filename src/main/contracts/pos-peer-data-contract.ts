import ModelNames from './open-data-contract';
import ResponseContract from './response-contract';

export default interface POSPeerDataContract {
  systemKey: string;
  authToken: string;
  type:
    | 'handshake:request'
    | 'handshake:response'
    | 'data:request'
    | 'data:response';
  request?: {
    type: `data:${ModelNames}`;
    query: string;
  };
  response?: ResponseContract;
}
