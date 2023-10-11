/* eslint-disable camelcase */
/* eslint-disable no-prototype-builtins */
import IObjectStorageAdaptor from 'App/interfaces/adaptor/object-storage/adaptor.object-storage.interface';
import IObjectStorageService from 'App/interfaces/service/service.object-storage.interface';
import fGetObject from 'App/modules/adaptor/object-storage/object-storage.f-get-object.module';
import fPutObject from 'App/modules/adaptor/object-storage/object-storage.f-put-object.module';
import getObject from 'App/modules/adaptor/object-storage/object-storage.get-object.module';
import listBuckets from 'App/modules/adaptor/object-storage/object-storage.list-buckets.module';
import listObjectsV2 from 'App/modules/adaptor/object-storage/object-storage.list-object-v2.module';
import listObjects from 'App/modules/adaptor/object-storage/object-storage.list-objects.module';
import makeBucket from 'App/modules/adaptor/object-storage/object-storage.make-bucket.module';
import putObject from 'App/modules/adaptor/object-storage/object-storage.put-object.module';
import removeObject from 'App/modules/adaptor/object-storage/object-storage.remove-object.module';

export default class ObjectStorageService
  implements Partial<IObjectStorageService>
{
  public readonly SERVICE_NAME: 'OBJECT_STORAGE_SERVICE';

  constructor(public readonly objectStorageAdaptor: IObjectStorageAdaptor) {}
}

Object.assign(ObjectStorageService.prototype, {
  makeBucket,
  fGetObject,
  fPutObject,
  getObject,
  listBuckets,
  listObjectsV2,
  listObjects,
  putObject,
  removeObject,
});
