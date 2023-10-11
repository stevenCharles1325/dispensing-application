/* eslint-disable consistent-return */
import {
  MakeBucketParamsWithCB,
  MakeBucketParamsWithNoCB,
} from 'App/interfaces/pos/pos.base-object-storage.interface';
import { MakeBucketOpt, NoResultCallback } from 'minio';

export default function makeBucket(
  this: any,
  params: MakeBucketParamsWithCB | MakeBucketParamsWithNoCB
): Promise<void> | void | any {
  if ('callback' in params) {
    const { bucketName, region = 'us-east-1', makeOpts, callback } = params;

    this.objectStorageAdaptor.makeBucket(
      bucketName,
      region,
      makeOpts,
      callback
    );
  } else {
    const { bucketName, region = 'us-east-1', makeOpts } = params;

    return this.objectStorageAdaptor.makeBucket(bucketName, region, makeOpts);
  }
}
