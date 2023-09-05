// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import AuthSignInContract from './contracts/auth-sign-in-contract';
import ResponseContract from './contracts/response-contract';
import UserContract from './contracts/user-contract';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    // -------------- POS FUNCTIONS --------------
    // AUTH MODULE
    authMe: async (): Promise<ResponseContract> =>
      ipcRenderer.invoke('auth:me'),

    authSignIn: async (
      payload: AuthSignInContract
    ): Promise<ResponseContract> => ipcRenderer.invoke('auth:sign-in', payload),

    // USER MODULE
    getUser: async (
      payload: Record<string, any[]>,
      page: number,
      total: number
    ): Promise<ResponseContract> =>
      ipcRenderer.invoke('user:show', payload, page, total),

    createUser: async (payload: UserContract): Promise<ResponseContract> =>
      ipcRenderer.invoke('user:create', payload),

    updateUser: async (
      id: number,
      payload: Partial<UserContract>
    ): Promise<ResponseContract> =>
      ipcRenderer.invoke('user:update', id, payload),

    archiveUser: async (id: number): Promise<ResponseContract> =>
      ipcRenderer.invoke('user:archive', id),

    deleteUser: async (id: number): Promise<ResponseContract> =>
      ipcRenderer.invoke('user:delete', id),

    // Connection to TURN server to start P2P connection
    // eslint-disable-next-line no-undef
    peerRequest: async (payload: PeerDataContract) =>
      ipcRenderer.invoke('peer:request', payload),
    // -------------- END POS FUNCTIONS --------------

    // MAIN FUNCTIONS
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
