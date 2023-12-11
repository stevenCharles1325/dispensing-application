import {
  AuditTrailHandler,
  AuthHandler,
  BarcodeHandler,
  BrandHandler,
  CategoryHandler,
  ExportHandler,
  ImageHandler,
  InventoryRecordHandler,
  ItemHandler,
  MainHandler,
  NotifHandler,
  PaymentHandler,
  PeerHandler,
  PermissionHandler,
  ReportHandler,
  RoleHandler,
  ShortcutKeyHandler,
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
    shortcutKey: ShortcutKeyHandler;
    image: ImageHandler;
    item: ItemHandler;
    inventoryRecord: InventoryRecordHandler;
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
