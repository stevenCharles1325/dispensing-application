// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import AuthSignInContract from './contracts/auth-sign-in-contract';
// import AuthSignInContract from './contracts/auth-sign-in-contract';
import UserContract from './contracts/user-contract';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    // -------------- POS FUNCTIONS --------------
    // AUTH MODULE
    authSignIn: async (payload: AuthSignInContract) =>
      ipcRenderer.invoke('auth:sign-in', payload),

    // USER MODULE
    createUser: async (payload: UserContract) =>
      ipcRenderer.invoke('user:create', payload),

    updateUser: async (id: number, payload: Partial<UserContract>) =>
      ipcRenderer.invoke('user:update', id, payload),

    archiveUser: async (id: number) => ipcRenderer.invoke('user:archive', id),

    deleteUser: async (id: number) => ipcRenderer.invoke('user:delete', id),

    // Connection to TURN server to start P2P connection
    online: async () => ipcRenderer.invoke('pos:initialize'),
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
