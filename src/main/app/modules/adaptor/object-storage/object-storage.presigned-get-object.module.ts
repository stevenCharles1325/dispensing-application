/* eslint-disable consistent-return */
import {
  PreSignedGetObjectParamsWithCB,
  PreSignedGetObjectParamsWithoutCB,
} from 'App/interfaces/pos/pos.base-object-storage.interface';

export default function presignedGetObject(
  this: any,
  params: PreSignedGetObjectParamsWithCB | PreSignedGetObjectParamsWithoutCB
): Promise<string> | void | any {
  if ('callback' in params) {
    const { bucketName, objectName, expiry, callback } = params;

    this.objectStorageAdaptor.presignedGetObject({
      bucketName,
      objectName,
      expiry,
      callback,
    });
  } else {
    const { bucketName, objectName, expiry } = params;

    return this.objectStorageAdaptor.presignedGetObject({
      bucketName,
      objectName,
      expiry,
    });
  }
}
