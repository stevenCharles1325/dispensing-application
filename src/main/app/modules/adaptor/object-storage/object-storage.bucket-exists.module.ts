/* eslint-disable consistent-return */
import {
  BucketExistsParamsWithCB,
  BucketExistsParamsWithoutCB,
} from 'App/interfaces/pos/pos.base-object-storage.interface';

export default function bucketExists(
  this: any,
  params: BucketExistsParamsWithCB | BucketExistsParamsWithoutCB
): void | Promise<boolean> | any {
  if ('callback' in params) {
    const { bucketName, callback } = params;

    this.objectStorageAdaptor.bucketExists({ bucketName, callback });
  } else {
    const { bucketName } = params;

    return this.objectStorageAdaptor.bucketExists({ bucketName });
  }
}
