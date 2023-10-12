/* eslint-disable consistent-return */
import {
  GetObjectParamsWithCB,
  GetObjectParamsWithoutCB,
} from 'App/interfaces/pos/pos.base-object-storage.interface';
import { Stream } from 'stream';

export default function getObject(
  this: any,
  params: GetObjectParamsWithCB | GetObjectParamsWithoutCB
): Promise<Stream> | void | any {
  if ('callback' in params) {
    const { bucketName, objectName, callback } = params;
    this.objectStorageAdaptor.getObject({ bucketName, objectName, callback });
  } else {
    const { bucketName, objectName } = params;
    return this.objectStorageAdaptor.getObject({ bucketName, objectName });
  }
}
