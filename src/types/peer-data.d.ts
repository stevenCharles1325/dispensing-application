import IResponse from 'App/interfaces/pos/pos.response.interface';

declare global {
  type POSChannels =
    | 'auth:me'
    | 'auth:sign-in'
    | 'auth:sign-up'
    | 'auth:sign-out'
    | 'peer:request'
    | 'peer:sync'
    | 'permission:archive'
    | 'permission:show'
    | 'role:show'
    | 'role:create'
    | 'role:update'
    | 'role:delete'
    | 'role:archive'
    | 'user:show'
    | 'user:create'
    | 'user:update'
    | 'user:archive';

  interface PeerDataContract {
    systemKey: string | null;
    type: 'request' | 'response';
    token: string;
    request?:
      | {
          name: POSChannels;
          body?: any;
        }
      | undefined;
    response?:
      | {
          name: POSChannels;
          body?: IResponse<unknown>;
        }
      | undefined;
  }
}

export {};
