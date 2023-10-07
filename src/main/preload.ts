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
import BrandDTO from 'App/data-transfer-objects/brand.dto';
import CategoryDTO from 'App/data-transfer-objects/category.dto';
import ImageDTO from 'App/data-transfer-objects/image.dto';
import SupplierDTO from 'App/data-transfer-objects/supplier.dto';

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

/* ================================
+
+         BRAND EVENT HANDLER
+
+ ================================ */
const brandHandler = {
  getBrands: async (
    payload: Record<string, any[]>,
    page: number = 1,
    total: number = 15
  ): Promise<IResponse<string[] | IPOSError[] | IPagination<BrandDTO>>> =>
    ipcRenderer.invoke('brand:show', payload, page, total),

  createBrand: async (
    payload: BrandDTO
  ): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | BrandDTO[]>
  > => ipcRenderer.invoke('brand:create', payload),

  updateBrand: async (
    id: number,
    payload: Partial<BrandDTO>
  ): Promise<IResponse<string[] | IPOSError[] | BrandDTO>> =>
    ipcRenderer.invoke('brand:update', id, payload),

  archiveBrand: async (
    id: number
  ): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('brand:archive', id),

  deleteBrand: async (id: number): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('brand:delete', id),
};

/* ================================
+
+       CATEGORY EVENT HANDLER
+
+ ================================ */
const categoryHandler = {
  getCategories: async (
    payload: Record<string, any[]>,
    page: number = 1,
    total: number = 15
  ): Promise<IResponse<string[] | IPOSError[] | IPagination<CategoryDTO>>> =>
    ipcRenderer.invoke('category:show', payload, page, total),

  createCategory: async (
    payload: CategoryDTO
  ): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | CategoryDTO[]>
  > => ipcRenderer.invoke('category:create', payload),

  updateCategory: async (
    id: number,
    payload: Partial<CategoryDTO>
  ): Promise<IResponse<string[] | IPOSError[] | CategoryDTO>> =>
    ipcRenderer.invoke('category:update', id, payload),

  archiveCategory: async (
    id: number
  ): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('category:archive', id),

  deleteCategory: async (
    id: number
  ): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('category:delete', id),
};

/* ================================
+
+       IMAGE EVENT HANDLER
+
+ ================================ */
const imageHandler = {
  getImages: async (
    payload: Record<string, any[]>,
    page: number = 1,
    total: number = 15
  ): Promise<IResponse<string[] | IPOSError[] | IPagination<ImageDTO>>> =>
    ipcRenderer.invoke('image:show', payload, page, total),

  createImage: async (
    payload: ImageDTO
  ): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | ImageDTO[]>
  > => ipcRenderer.invoke('image:create', payload),

  updateImage: async (
    id: number,
    payload: Partial<ImageDTO>
  ): Promise<IResponse<string[] | IPOSError[] | ImageDTO>> =>
    ipcRenderer.invoke('image:update', id, payload),

  archiveImage: async (
    id: number
  ): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('image:archive', id),

  deleteImage: async (id: number): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('image:delete', id),
};

/* ================================
+
+       IMAGE EVENT HANDLER
+
+ ================================ */
const supplierHandler = {
  getSuppliers: async (
    payload: Record<string, any[]>,
    page: number = 1,
    total: number = 15
  ): Promise<IResponse<string[] | IPOSError[] | IPagination<SupplierDTO>>> =>
    ipcRenderer.invoke('supplier:show', payload, page, total),

  createSupplier: async (
    payload: SupplierDTO
  ): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | SupplierDTO[]>
  > => ipcRenderer.invoke('supplier:create', payload),

  updateSupplier: async (
    id: number,
    payload: Partial<SupplierDTO>
  ): Promise<IResponse<string[] | IPOSError[] | SupplierDTO>> =>
    ipcRenderer.invoke('supplier:update', id, payload),

  archiveSupplier: async (
    id: number
  ): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('supplier:archive', id),

  deleteSupplier: async (
    id: number
  ): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('supplier:delete', id),
};

// EXPOSING HANDLERS
contextBridge.exposeInMainWorld('auth', authHandler);
contextBridge.exposeInMainWorld('peer', peerHandler);
contextBridge.exposeInMainWorld('user', userHandler);
contextBridge.exposeInMainWorld('item', itemHandler);
contextBridge.exposeInMainWorld('brand', brandHandler);
contextBridge.exposeInMainWorld('image', imageHandler);
contextBridge.exposeInMainWorld('category', categoryHandler);
contextBridge.exposeInMainWorld('supplier', supplierHandler);

export type AuthHandler = typeof authHandler;
export type PeerHandler = typeof peerHandler;
export type UserHandler = typeof userHandler;
export type ItemHandler = typeof itemHandler;
export type ImageHandler = typeof imageHandler;
export type BrandHandler = typeof brandHandler;
export type CategoryHandler = typeof categoryHandler;
export type SupplierHandler = typeof supplierHandler;
