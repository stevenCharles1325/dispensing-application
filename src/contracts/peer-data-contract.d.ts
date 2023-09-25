import DataName from 'Main/app/interfaces/open-data-contract';
import ResponseContract from 'Main/app/interfaces/response-contract';
import UserContract from 'Main/app/contracts/user-contract';

declare global {
  type DataActions =
    | 'show'
    | 'create'
    | 'update'
    | 'delete'
    | 'archive'
    | 'sync'
    | 'sign-in';

  interface PeerDataContract {
    systemKey: string | null;
    type: 'request' | 'response';
    token: string;
    request?:
      | {
          name: `${DataName}:${DataActions}`;
          body?: any;
        }
      | undefined;
    response?:
      | {
          name: `${DataName}:${DataActions}`;
          body?: ResponseContract;
        }
      | undefined;
  }
}

export {};
