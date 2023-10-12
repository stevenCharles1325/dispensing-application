import { ListObjectV2Params } from 'App/interfaces/pos/pos.base-object-storage.interface';
import { Stream } from 'stream';

export default function listObjectsV2(
  this: any,
  params: ListObjectV2Params
): Stream {
  const { bucketName, prefix, recursive, startAfter } = params;
  return this.objectStorageAdaptor.listObjectsV2({
    bucketName,
    prefix,
    recursive,
    startAfter,
  });
}
