// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import UserContract from './contracts/user-contract';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    // POS FUNCTIONS
    createUser: async (payload: UserContract) =>
      ipcRenderer.invoke('user:create', payload),

    updateUser: async (id: number, payload: UserContract) =>
      ipcRenderer.invoke('user:update', id, payload),

    deleteUser: async (id: number) => ipcRenderer.invoke('user:delete', id),

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
