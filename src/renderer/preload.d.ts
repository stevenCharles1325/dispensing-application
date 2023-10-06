import { AuthHandler, PeerHandler, UserHandler } from 'Main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    auth: AuthHandler;
    peer: PeerHandler;
    user: UserHandler;
  }
}

export {};
