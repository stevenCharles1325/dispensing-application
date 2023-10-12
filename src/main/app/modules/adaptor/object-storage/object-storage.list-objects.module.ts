import { ListObjectsParams } from 'App/interfaces/pos/pos.base-object-storage.interface';
import { Stream } from 'stream';

export default function listObjects(
  this: any,
  params: ListObjectsParams
): Stream {
  const { bucketName, prefix, recursive } = params;
  return this.objectStorageAdaptor.listObjects({
    bucketName,
    prefix,
    recursive,
  });
}
