import ModelNames from 'Main/contracts/open-data-contract';
import ResponseContract from 'Main/contracts/response-contract';
import UserContract from 'Main/contracts/user-contract';

declare global {
  type DataActions =
    | 'show'
    | 'create'
    | 'update'
    | 'delete'
    | 'archive'
    | 'sync';

  interface PeerDataContract {
    systemKey: string | null;
    systemId: string;
    type: 'request' | 'response';
    user: UserContract;
    request?:
      | {
          name: `${ModelNames}:${DataActions}`;
          body?: any;
        }
      | undefined;
    response?:
      | {
          name: `${ModelNames}:${DataActions}`;
          body?: ResponseContract;
        }
      | undefined;
  }
}

export {};
