/* eslint-disable consistent-return */
import { GetFilePathParams } from 'App/interfaces/pos/pos.base-object-storage.interface';

export default function getFilePath(
  this: any,
  params: GetFilePathParams
): string {
  return this.objectStorageAdaptor.getFilePath(params);
}
