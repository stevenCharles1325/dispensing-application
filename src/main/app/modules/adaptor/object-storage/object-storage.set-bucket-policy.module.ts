/* eslint-disable consistent-return */
import {
  SetBucketPolicyParamsWithCB,
  SetBucketPolicyParamsWithoutCB,
} from 'App/interfaces/pos/pos.base-object-storage.interface';

export default function setBucketPolicy(
  this: any,
  params: SetBucketPolicyParamsWithCB | SetBucketPolicyParamsWithoutCB
): void | Promise<boolean> | any {
  if ('callback' in params) {
    const { bucketName, bucketPolicy, callback } = params;

    this.objectStorageAdaptor.setBucketPolicy({
      bucketName,
      bucketPolicy,
      callback,
    });
  } else {
    const { bucketName, bucketPolicy } = params;

    return this.objectStorageAdaptor.setBucketPolicy({
      bucketName,
      bucketPolicy,
    });
  }
}
