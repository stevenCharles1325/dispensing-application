import ModelNames from 'Main/contracts/open-data-contract';
import ResponseContract from 'Main/contracts/response-contract';

export {};

declare global {
  interface PeerDataContract {
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
}
