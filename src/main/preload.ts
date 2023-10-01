// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import IAuthSignIn from './app/interfaces/auth/auth.sign-in.interface';
import IResponse from './app/interfaces/pos/pos.response.interface';
import UserDTO from './app/data-transfer-objects/user.dto';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IAuth from 'App/interfaces/auth/auth.interface';
import { User } from './database/models/user.model';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    // -------------- POS FUNCTIONS --------------
    // AUTH MODULE
    authMe: async (): Promise<IResponse<Partial<UserDTO> | IPOSError[]>> =>
      ipcRenderer.invoke('auth:me'),

    authSignIn: async (
      payload: IAuthSignIn
    ): Promise<IResponse<IAuth<User> | IPOSError[]>> =>
      ipcRenderer.invoke('auth:sign-in', payload),

    // USER MODULE
    getUser: async (
      payload: Record<string, any[]>,
      page: number = 1,
      total: number = 15
    ): Promise<IResponse<string[] | IPOSError[] | IPagination>> =>
      ipcRenderer.invoke('user:show', payload, page, total),

    createUser: async (
      payload: UserDTO
    ): Promise<
      IResponse<string[] | IPOSError[] | IPOSValidationError[] | User[]>
    > => ipcRenderer.invoke('user:create', payload),

    updateUser: async (
      id: number,
      payload: Partial<UserDTO>
    ): Promise<IResponse<string[] | IPOSError[] | User>> =>
      ipcRenderer.invoke('user:update', id, payload),

    archiveUser: async (
      id: number
    ): Promise<IResponse<string[] | IPOSError[]>> =>
      ipcRenderer.invoke('user:archive', id),

    deleteUser: async (
      id: number
    ): Promise<IResponse<string[] | IPOSError[]>> =>
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
