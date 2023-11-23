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
import ItemDTO from 'App/data-transfer-objects/item.dto';
import bucketNames from 'src/globals/object-storage/bucket-names';
import PaymentDTO from 'App/data-transfer-objects/payment.dto';
import AuditTrailDTO from 'App/data-transfer-objects/audit-trail.dto';
import { IncomeDTO } from 'App/data-transfer-objects/transaction.dto';
import IReport from 'App/interfaces/report/report.interface';
import NotificationDTO from 'App/data-transfer-objects/notification.dto';
import RoleDTO from 'App/data-transfer-objects/role.dto';
import PermissionDTO from 'App/data-transfer-objects/permission.dto';
import { PermissionsKebabType } from './data/defaults/permissions';

export type Channels = 'ipc-pos';


/* ================================
+
+         MAIN EVENT HANDLER
+
+ ================================ */
const storageHandler = {
  get: (key: string): any => ipcRenderer.sendSync('storage:get', key),
  set: (key: string, value: any): any => ipcRenderer.sendSync('storage:set', key, value),
  remove: (key: string): any => ipcRenderer.sendSync('storage:remove', key),
  clear: (): any => ipcRenderer.sendSync('storage:clear'),
};


/* ================================
+
+         MAIN EVENT HANDLER
+
+ ================================ */
const mainHandler = {
  mainMessage: (
    callback: (
      event: any,
      payload: {
        channel: string,
        data: any
      }
    ) => void
  ) => ipcRenderer.on('main-message', callback),
}


/* ================================
+
+   USER VALIDATION EVENT HANDLER
+
+ ================================ */
const validationHandler = {
  isUserPermitted: async (): Promise<boolean> =>
    ipcRenderer.invoke('get:master-key'),
  makeUserPermitted: async (key: string): Promise<boolean> =>
    ipcRenderer.invoke('set:master-key', key),
};

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

  authSignOut: async (): Promise<IResponse<null | IPOSError[]>> =>
    ipcRenderer.invoke('auth:sign-out'),

  authUpdateMe: async (
    payload: Partial<
      UserDTO & { isChangingPassword: boolean; current_password?: string }
    >
  ): Promise<IResponse<null | IPOSError[]>> =>
    ipcRenderer.invoke('auth:update-me', payload),
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
    payload: Record<string, any | any[]> | string = 'all',
    page: number = 1,
    total: number | 'max' = 15
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

  deleteUser: async (id: number | number[]): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('user:delete', id),
};

/* ================================
+
+         ROLE EVENT HANDLER
+
+ ================================ */
const roleHandler = {
  getRoles: async (
    payload: Record<string, any | any[]> | string = 'all',
    page: number = 1,
    total: number | 'max' = 15
  ): Promise<IResponse<string[] | IPOSError[] | IPagination<RoleDTO>>> =>
    ipcRenderer.invoke('role:show', payload, page, total),

  createRole: async (
    payload: RoleDTO,
    permissionIds: number[],
  ): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | RoleDTO[]>
  > => ipcRenderer.invoke('role:create', payload, permissionIds),

  updateRole: async (
    id: number,
    payload: Partial<RoleDTO>,
    permissionIds: number[],
  ): Promise<IResponse<string[] | IPOSError[] | UserDTO>> =>
    ipcRenderer.invoke('role:update', id, payload, permissionIds),

  archiveRole: async (id: number): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('role:archive', id),

  deleteRole: async (id: number | number[]): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('role:delete', id),
};

/* ================================
+
+     PERMISSIONS EVENT HANDLER
+
+ ================================ */
const permissionHandler = {
  getPermissions: async (
    payload: Record<string, any | any[]> | string = 'all',
    page: number = 1,
    total: number | 'max' = 15
  ): Promise<IResponse<string[] | IPOSError[] | IPagination<PermissionDTO>>> =>
    ipcRenderer.invoke('permission:show', payload, page, total),

  hasPermission: (
    ...permissions: PermissionsKebabType[]
  ): Promise<IResponse<string[] | IPOSError[] | Boolean>> =>
    ipcRenderer.invoke('permission:user-check', ...permissions),
};

/* ================================
+
+         ITEM EVENT HANDLER
+
+ ================================ */
const itemHandler = {
  getItems: async (
    payload: Record<string, any | any[]> | string = 'all',
    page: number = 1,
    total: number | 'max' = 15
  ): Promise<IResponse<string[] | IPOSError[] | IPagination<ItemDTO>>> =>
    ipcRenderer.invoke('item:show', payload, page, total),

  createItem: async (
    payload: ItemDTO
  ): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | ItemDTO[]>
  > => ipcRenderer.invoke('item:create', payload),

  updateItem: async (
    id: string,
    payload: Partial<ItemDTO>
  ): Promise<IResponse<string[] | IPOSError[] | ItemDTO>> =>
    ipcRenderer.invoke('item:update', id, payload),

  archiveItem: async (
    id: string | string[]
  ): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('item:archive', id),

  deleteItem: async (
    id: string | string[]
  ): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('item:delete', id),
};

/* ================================
+
+         BRAND EVENT HANDLER
+
+ ================================ */
const brandHandler = {
  getBrands: async (
    payload: Record<string, any | any[]> | string = 'all',
    page: number = 1,
    total: number | 'max' = 15
  ): Promise<IResponse<string[] | IPOSError[] | IPagination<BrandDTO>>> =>
    ipcRenderer.invoke('brand:show', payload, page, total),

  createBrand: async (
    payload: Pick<BrandDTO, 'name' | 'description'>
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

  deleteBrand: async (
    id: number | number[]
  ): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('brand:delete', id),
};

/* ================================
+
+       CATEGORY EVENT HANDLER
+
+ ================================ */
const categoryHandler = {
  getCategories: async (
    payload: Record<string, any | any[]> | string = 'all',
    page: number = 1,
    total: number | 'max' = 15
  ): Promise<IResponse<string[] | IPOSError[] | IPagination<CategoryDTO>>> =>
    ipcRenderer.invoke('category:show', payload, page, total),

  createCategory: async (
    payload: Pick<CategoryDTO, 'name' | 'description'>
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
    id: number | number[]
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
    payload: Record<string, any | any[]> | string = 'all',
    page: number = 1,
    total: number | 'max' = 10
  ): Promise<IResponse<string[] | IPOSError[] | IPagination<ImageDTO>>> =>
    ipcRenderer.invoke('image:show', payload, page, total),

  createImage: async (
    bucketName: (typeof bucketNames)[number],
    payload: Omit<
      ImageDTO,
      'id' | 'uploader' | 'uploader_id' | 'created_at' | 'deleted_at'
    >
  ): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | ImageDTO>
  > => ipcRenderer.invoke('image:create', bucketName, payload),

  updateImage: async (
    id: number,
    payload: Partial<ImageDTO>
  ): Promise<IResponse<string[] | IPOSError[] | ImageDTO>> =>
    ipcRenderer.invoke('image:update', id, payload),

  archiveImage: async (
    id: number
  ): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('image:archive', id),

  deleteImage: async (
    id: number | number[]
  ): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('image:delete', id),
};

/* ================================
+
+       SUPPLIER EVENT HANDLER
+
+ ================================ */
const supplierHandler = {
  getSuppliers: async (
    payload: Record<string, any | any[]> | string = 'all',
    page: number = 1,
    total: number | 'max' = 15
  ): Promise<IResponse<string[] | IPOSError[] | IPagination<SupplierDTO>>> =>
    ipcRenderer.invoke('supplier:show', payload, page, total),

  createSupplier: async (
    payload: SupplierDTO
  ): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | SupplierDTO[]>
  > => ipcRenderer.invoke('supplier:create', payload),

  updateSupplier: async (
    id: string,
    payload: Partial<SupplierDTO>
  ): Promise<IResponse<string[] | IPOSError[] | SupplierDTO>> =>
    ipcRenderer.invoke('supplier:update', id, payload),

  archiveSupplier: async (
    id: string
  ): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('supplier:archive', id),

  deleteSupplier: async (
    id: string | string[]
  ): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('supplier:delete', id),
};

/* ================================
+
+       PAYMENT EVENT HANDLER
+
+ ================================ */
const paymentHandler = {
  getPayments: async (
    payload: Record<string, any | any[]> | string = 'all',
    page: number = 1,
    total: number | 'max' = 15
  ): Promise<IResponse<string[] | IPOSError[] | IPagination<IncomeDTO>>> =>
    ipcRenderer.invoke('payment:show', payload, page, total),

  createPayment: async (
    payload: PaymentDTO
  ): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | PaymentDTO[]>
  > => ipcRenderer.invoke('payment:create', payload),

  // updateSupplier: async (
  //   id: number,
  //   payload: Partial<SupplierDTO>
  // ): Promise<IResponse<string[] | IPOSError[] | SupplierDTO>> =>
  //   ipcRenderer.invoke('supplier:update', id, payload),

  // archiveSupplier: async (
  //   id: number
  // ): Promise<IResponse<string[] | IPOSError[]>> =>
  //   ipcRenderer.invoke('supplier:archive', id),

  // deleteSupplier: async (
  //   id: number | number[]
  // ): Promise<IResponse<string[] | IPOSError[]>> =>
  //   ipcRenderer.invoke('supplier:delete', id),
};

/* ================================
+
+     AUDIT TRAIL EVENT HANDLER
+
+ ================================ */
const auditTrailHandler = {
  getAuditTrail: async (
    payload: Record<string, any | any[]> | string = 'all',
    page: number = 1,
    total: number | 'max' = 15
  ): Promise<IResponse<string[] | IPOSError[] | IPagination<AuditTrailDTO>>> =>
    ipcRenderer.invoke('audit-trail:show', payload, page, total),
};

/* ================================
+
+       REPORT EVENT HANDLER
+
+ ================================ */
const reportHandler = {
  getReport: async (): Promise<IResponse<string[] | IPOSError[] | IReport>> =>
    ipcRenderer.invoke('report:show'),

  getReportHistory: async (
    startDate: string | null = null,
    endDate: string | null = null,
    groupBy: 'DAILY' | 'MONTHLY' | 'YEARLY' = 'DAILY',
  ): Promise<IResponse<string[] | IPOSError[] | IReport>> =>
    ipcRenderer.invoke('report-history:show', startDate, endDate, groupBy),
};

/* ================================
+
+   NOTIFICATION EVENT HANDLER
+
+ ================================ */
const notifHandler = {
  getNotifs: async (
    payload: Record<string, any | any[]> | string = 'all',
    page: number = 1,
    total: number | 'max' = 15
  ): Promise<IResponse<string[] | IPOSError[] | IPagination<NotificationDTO>>> =>
    ipcRenderer.invoke('notification:show', payload, page, total),

  updateNotif: async (
    id: string,
    payload: 'SEEN' | 'UNSEEN' | 'VISITED',
  ): Promise<IResponse<string[] | IPOSError[] | NotificationDTO>> =>
    ipcRenderer.invoke('notification:update', id, payload),

  deleteNotif: async (
    id: string | string[]
  ): Promise<IResponse<string[] | IPOSError[]>> =>
    ipcRenderer.invoke('notification:delete', id),
};

const exportHandler = {
  exportTransactionHistory: async (
    payload: 'WHOLE' | 'CURRENT:DAY' | 'CURRENT:MONTH' | 'CURRENT:YEAR' = 'WHOLE',
  ): Promise<IResponse<string[] | IPOSError[] | null>> =>
    ipcRenderer.invoke('transaction-history:export', payload),
};

// EXPOSING HANDLERS
contextBridge.exposeInMainWorld('storage', storageHandler);
contextBridge.exposeInMainWorld('main', mainHandler);
contextBridge.exposeInMainWorld('auth', authHandler);
contextBridge.exposeInMainWorld('peer', peerHandler);
contextBridge.exposeInMainWorld('user', userHandler);
contextBridge.exposeInMainWorld('role', roleHandler);
contextBridge.exposeInMainWorld('permission', permissionHandler);
contextBridge.exposeInMainWorld('item', itemHandler);
contextBridge.exposeInMainWorld('brand', brandHandler);
contextBridge.exposeInMainWorld('image', imageHandler);
contextBridge.exposeInMainWorld('category', categoryHandler);
contextBridge.exposeInMainWorld('supplier', supplierHandler);
contextBridge.exposeInMainWorld('payment', paymentHandler);
contextBridge.exposeInMainWorld('auditTrail', auditTrailHandler);
contextBridge.exposeInMainWorld('report', reportHandler);
contextBridge.exposeInMainWorld('notif', notifHandler);
contextBridge.exposeInMainWorld('validation', validationHandler);
contextBridge.exposeInMainWorld('export', exportHandler);

export type StorageHandler = typeof storageHandler;
export type MainHandler = typeof mainHandler;
export type AuthHandler = typeof authHandler;
export type PeerHandler = typeof peerHandler;
export type UserHandler = typeof userHandler;
export type RoleHandler = typeof roleHandler;
export type PermissionHandler = typeof permissionHandler;
export type ItemHandler = typeof itemHandler;
export type ImageHandler = typeof imageHandler;
export type BrandHandler = typeof brandHandler;
export type CategoryHandler = typeof categoryHandler;
export type SupplierHandler = typeof supplierHandler;
export type PaymentHandler = typeof paymentHandler;
export type AuditTrailHandler = typeof auditTrailHandler;
export type ReportHandler = typeof reportHandler;
export type NotifHandler = typeof notifHandler;
export type ValidationHandler = typeof validationHandler;
export type ExportHandler = typeof exportHandler;
