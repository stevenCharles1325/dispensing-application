export default function listBuckets(
  this: any
): Promise<Array<{ name: string; creationDate: Date }>> {
  return this.objectStorageAdaptor.listBuckets();
}
