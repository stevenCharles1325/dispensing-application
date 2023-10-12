import {
  FPutObjectParamsWithCB,
  FPutObjectParamsWithoutCB,
} from 'App/interfaces/pos/pos.base-object-storage.interface';

/* eslint-disable consistent-return */
export default function fPutObject(
  this: any,
  params: FPutObjectParamsWithCB | FPutObjectParamsWithoutCB
): Promise<any> | void | any {
  if ('callback' in params) {
    const { bucketName, objectName, filePath, metaData, callback } = params;
    this.objectStorageAdaptor.fPutObject({
      bucketName,
      objectName,
      filePath,
      metaData,
      callback,
    });
  } else {
    const { bucketName, objectName, filePath, metaData } = params;
    return this.objectStorageAdaptor.fPutObject({
      bucketName,
      objectName,
      filePath,
      metaData,
    });
  }
}
