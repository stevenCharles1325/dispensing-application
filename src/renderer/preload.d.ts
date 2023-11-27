import {
  AuditTrailHandler,
  AuthHandler,
  BarcodeHandler,
  BrandHandler,
  CategoryHandler,
  ExportHandler,
  ImageHandler,
  ItemHandler,
  MainHandler,
  NotifHandler,
  PaymentHandler,
  PeerHandler,
  PermissionHandler,
  ReportHandler,
  RoleHandler,
  StorageHandler,
  SupplierHandler,
  UserHandler,
  ValidationHandler,
} from 'Main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    storage: StorageHandler;
    barcode: BarcodeHandler;
    main: MainHandler;
    auth: AuthHandler;
    peer: PeerHandler;
    user: UserHandler;
    image: ImageHandler;
    item: ItemHandler;
    brand: BrandHandler;
    category: CategoryHandler;
    supplier: SupplierHandler;
    payment: PaymentHandler;
    auditTrail: AuditTrailHandler;
    report: ReportHandler;
    notif: NotifHandler;
    validation: ValidationHandler;
    export: ExportHandler;
    role: RoleHandler;
    permission: PermissionHandler;
  }
}

export {};
