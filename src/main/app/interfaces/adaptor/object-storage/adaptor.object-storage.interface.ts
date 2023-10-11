import IBaseObjectStorage from 'App/interfaces/pos/pos.base-object-storage.interface';

export default interface IObjectStorageAdaptor extends IBaseObjectStorage {
  readonly config: {
    object_storage_access_key: string;
    object_storage_secret_key: string;
    object_storage_port: number;
    object_storage_endpoint: string;
  };

  readonly client: any;
}
