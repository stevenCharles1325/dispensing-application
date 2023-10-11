import {
  RemoveObjectParamsWithCB,
  RemoveObjectParamsWithoutCB,
} from 'App/interfaces/pos/pos.base-object-storage.interface';

/* eslint-disable consistent-return */
export default function removeObject(
  this: any,
  params: RemoveObjectParamsWithCB | RemoveObjectParamsWithoutCB
): Promise<void> | void | any {
  if ('callback' in params) {
    const { bucketName, objectName, removeOpts, callback } = params;
    this.objectStorageAdaptor.removeObject(
      bucketName,
      objectName,
      removeOpts,
      callback
    );
  } else {
    const { bucketName, objectName, removeOpts } = params;
    return this.objectStorageAdaptor.removeObject(
      bucketName,
      objectName,
      removeOpts
    );
  }
}
