import Provider from '@IOC:Provider';
import IProvider from 'App/interfaces/provider/provider.interface';
import ObjectStorageService from 'App/services/object-storage.service';
import MinioConfig from 'Main/config/minio.config';
import { MinioAdaptor } from 'App/adaptors/object-storage/minio.adaptor';

export default class ObjectStorageProvider implements IProvider {
  constructor(public provider: typeof Provider) {}

  public run() {
    this.provider.singleton('ObjectStorageProvider', () => {
      try {
        const objectStorage = new MinioAdaptor(MinioConfig);

        return new ObjectStorageService(objectStorage);
      } catch (err) {
        console.log('[OBJECT-STORAGE-ERROR]: ', err);
        throw err;
      }
    });
  }
}
