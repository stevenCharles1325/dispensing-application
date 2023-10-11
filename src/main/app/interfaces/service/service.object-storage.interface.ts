import IObjectStorageAdaptor from '../adaptor/object-storage/adaptor.object-storage.interface';
import IBaseObjectStorage from '../pos/pos.base-object-storage.interface';
import IService from './service.interface';

export default interface IObjectStorageService
  extends IService,
    IBaseObjectStorage {
  readonly objectStorageAdaptor: IObjectStorageAdaptor;
}
