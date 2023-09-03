import DataName from 'Main/contracts/open-data-contract';
import ResponseContract from 'Main/contracts/response-contract';
import UserContract from 'Main/contracts/user-contract';

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
    user: UserContract;
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
