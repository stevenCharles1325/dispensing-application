import {
  AuthHandler,
  BrandHandler,
  CategoryHandler,
  ImageHandler,
  ItemHandler,
  PeerHandler,
  SupplierHandler,
  UserHandler,
} from 'Main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    auth: AuthHandler;
    peer: PeerHandler;
    user: UserHandler;
    image: ImageHandler;
    item: ItemHandler;
    brand: BrandHandler;
    category: CategoryHandler;
    supplier: SupplierHandler;
  }
}

export {};
