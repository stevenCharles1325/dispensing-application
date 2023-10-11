/* eslint-disable consistent-return */
import { FGetObjectParamsWithCB } from 'App/interfaces/pos/pos.base-object-storage.interface';

export default function fGetObject(
  this: any,
  params: FGetObjectParamsWithCB
): void | Promise<void> | any {
  if ('callback' in params) {
    const { bucketName, objectName, filePath, callback } = params;

    this.objectStorageAdaptor.fGetObject(
      bucketName,
      objectName,
      filePath,
      callback
    );
  } else {
    const { bucketName, objectName, filePath } = params;

    return this.objectStorageAdaptor.fGetObject(
      bucketName,
      objectName,
      filePath
    );
  }
}
