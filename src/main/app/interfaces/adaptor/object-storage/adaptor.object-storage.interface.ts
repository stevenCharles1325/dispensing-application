import IBaseObjectStorage from 'App/interfaces/pos/pos.base-object-storage.interface';

export default interface IObjectStorageAdaptor extends IBaseObjectStorage {
  readonly config: {
    object_storage_client_access_key: string;
    object_storage_client_secret_key: string;
    object_storage_client_port: number;
    object_storage_client_endpoint: string;
  };

  readonly client: any;
}
