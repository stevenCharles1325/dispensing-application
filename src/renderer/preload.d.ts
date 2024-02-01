import {
  AuditTrailHandler,
  AuthHandler,
  BarcodeHandler,
  BrandHandler,
  CategoryHandler,
  DiscountHandler,
  ExportHandler,
  ImageHandler,
  ImportHandler,
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
  SystemHandler,
  PrinterHandler,
  POSHandler,
} from 'Main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    pos: POSHandler;
    storage: StorageHandler;
    barcode: BarcodeHandler;
    main: MainHandler;
    auth: AuthHandler;
    peer: PeerHandler;
    user: UserHandler;
    shortcutKey: ShortcutKeyHandler;
    image: ImageHandler;
    item: ItemHandler;
    discount: DiscountHandler;
    inventoryRecord: InventoryRecordHandler;
    brand: BrandHandler;
    category: CategoryHandler;
    supplier: SupplierHandler;
    payment: PaymentHandler;
    auditTrail: AuditTrailHandler;
    report: ReportHandler;
    notif: NotifHandler;
    system: SystemHandler;
    export: ExportHandler;
    import: ImportHandler;
    role: RoleHandler;
    permission: PermissionHandler;
    printer: PrinterHandler;
  }
}

export {};
