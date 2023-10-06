// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from 'electron';
import IAuthSignIn from './app/interfaces/auth/auth.sign-in.interface';
import IResponse from './app/interfaces/pos/pos.response.interface';
import UserDTO from './app/data-transfer-objects/user.dto';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IAuth from 'App/interfaces/auth/auth.interface';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';

export type Channels = 'ipc-pos';

/* ================================
+
+   AUTHENTICATION EVENT HANDLER
+
+ ================================ */
const authHandler = {
  authMe: async (): Promise<IResponse<Partial<UserDTO> | IPOSError[]>> =>
    ipcRenderer.invoke('auth:me'),

  authSignIn: async (
    payload: IAuthSignIn
  ): Promise<IResponse<IAuth<UserDTO> | IPOSError[]>> =>
    ipcRenderer.invoke('auth:sign-in', payload),
};

/* ================================
+
+         PEER EVENT HANDLER
+
+ ================================ */
const peerHandler = {
  // Connection to TURN server to start P2P connection
  // eslint-disable-next-line no-undef
  peerRequest: async (payload: PeerDataContract) =>
    ipcRenderer.invoke('peer:request', payload),
};

/* ================================
+
+         USER EVENT HANDLER
+
+ ================================ */
const userHandler = {
  getUsers: async (
    payload: Record<string, any[]>,
    page: number = 1,
    total: number = 15
  ): Promise<IResponse<string[] | IPOSError[] | IPagination<UserDTO>>> =>
    ipcRenderer.invoke('user:show', payload, page, total),

  createUser: async (
    payload: UserDTO
  ): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | UserDTO[]>
  > => ipcRenderer.invoke('user:create', payload),

  updateUser: async (
    id: number,
    payload: Partial<UserDTO>
  ): Promise<IResponse<string[] | IPOSError[] | UserDTO>> =>
    ipcRenderer.invoke('user:update', id, payload),

  archiveUser: async (id: number): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('user:archive', id),

  deleteUser: async (id: number): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('user:delete', id),
};

/* ================================
+
+         ITEM EVENT HANDLER
+
+ ================================ */
const itemHandler = {
  getItems: async (
    payload: Record<string, any[]>,
    page: number = 1,
    total: number = 15
  ): Promise<IResponse<string[] | IPOSError[] | IPagination<UserDTO>>> =>
    ipcRenderer.invoke('item:show', payload, page, total),

  createItem: async (
    payload: UserDTO
  ): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | ItemDTO[]>
  > => ipcRenderer.invoke('item:create', payload),

  updateItem: async (
    id: number,
    payload: Partial<UserDTO>
  ): Promise<IResponse<string[] | IPOSError[] | UserDTO>> =>
    ipcRenderer.invoke('item:update', id, payload),

  archiveItem: async (id: number): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('item:archive', id),

  deleteItem: async (id: number): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('item:delete', id),
};

// EXPOSING HANDLERS
contextBridge.exposeInMainWorld('auth', authHandler);
contextBridge.exposeInMainWorld('peer', peerHandler);
contextBridge.exposeInMainWorld('user', userHandler);
contextBridge.exposeInMainWorld('item', itemHandler);

export type AuthHandler = typeof authHandler;
export type PeerHandler = typeof peerHandler;
export type UserHandler = typeof userHandler;
export type ItemHandler = typeof itemHandler;
