import {
  PutObjectParamsWithCB,
  PutObjectParamsWithoutCB,
} from 'App/interfaces/pos/pos.base-object-storage.interface';

/* eslint-disable consistent-return */
export default function putObject(
  this: any,
  params: PutObjectParamsWithCB | PutObjectParamsWithoutCB
): void | Promise<void> | any {
  if ('callback' in params) {
    const { bucketName, objectName, stream, size, metaData, callback } = params;
    this.objectStorageAdaptor.putObject(
      bucketName,
      objectName,
      stream,
      size,
      metaData,
      callback
    );
  } else {
    const { bucketName, objectName, stream, size, metaData } = params;
    return this.objectStorageAdaptor.putObject(
      bucketName,
      objectName,
      stream,
      size,
      metaData
    );
  }
}
