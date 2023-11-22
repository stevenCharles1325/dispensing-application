import {
  AuditTrailHandler,
  AuthHandler,
  BrandHandler,
  CategoryHandler,
  ExportHandler,
  ImageHandler,
  ItemHandler,
  MainHandler,
  NotifHandler,
  PaymentHandler,
  PeerHandler,
  ReportHandler,
  RoleHandler,
  SupplierHandler,
  UserHandler,
  ValidationHandler,
} from 'Main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
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
  }
}

export {};
