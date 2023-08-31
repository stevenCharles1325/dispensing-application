import ModelNames from 'Main/contracts/open-data-contract';
import ResponseContract from 'Main/contracts/response-contract';

export {};

declare global {
  type DataActions = 'show' | 'create' | 'update' | 'delete' | 'archive';

  interface PeerDataContract {
    systemKey: string;
    type: 'request' | 'response';
    request?:
      | {
          name: `${ModelNames}:${DataActions}`;
          body: any;
        }
      | undefined;
    response?: ResponseContract | undefined;
  }
}
