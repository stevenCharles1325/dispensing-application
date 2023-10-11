import { Readable, Stream } from 'stream';

export type MakeBucketParamsWithCB = {
  bucketName: string;
  region?: string;
  makeOpts?: Record<string, any>;
  callback: (err: any) => void;
};

export type MakeBucketParamsWithNoCB = Omit<MakeBucketParamsWithCB, 'callback'>;

export type BucketExistsParamsWithCB = {
  bucketName: string;
  callback: (err: any, exists: boolean) => void;
};

export type BucketExistsParamsWithoutCB = Omit<
  BucketExistsParamsWithCB,
  'callback'
>;

export type ListObjectsParams = {
  bucketName: string;
  prefix?: string;
  recursive?: boolean;
};

export type ListObjectV2Params = {
  bucketName: string;
  prefix?: string;
  recursive?: boolean;
  startAfter?: string;
};

export type ListObjectV2WithMetadata = {
  bucketName: string;
  prefix?: string;
  recursive?: boolean;
  startAfter?: string;
};

export type GetObjectParamsWithCB = {
  bucketName: string;
  objectName: string;
  getOpts: Record<string, any>;
  callback: (err: any, stream: Stream) => void;
};

export type GetObjectParamsWithoutCB = Omit<GetObjectParamsWithCB, 'callback'>;

export type FGetObjectParamsWithCB = {
  bucketName: string;
  objectName: string;
  filePath: string;
  getOpts: Record<string, any>;
  callback: (err: unknown) => void;
};

export type FGetObjectParamsWithoutCB = Omit<
  FGetObjectParamsWithCB,
  'callback'
>;

export type PutObjectParamsWithCB = {
  bucketName: string;
  objectName: string;
  stream: string | Readable | Buffer;
  size: number;
  metaData: Record<string, any>;
  callback: (err: any, objectInfo: { etag: string; versionId: string }) => void;
};

export type PutObjectParamsWithoutCB = Omit<PutObjectParamsWithCB, 'callback'>;

export type FPutObjectParamsWithCB = {
  bucketName: string;
  objectName: string;
  filePath: string;
  metaData: Record<string, any>;
  callback: (err: any, objectInfo: { etag: string; versionId: string }) => void;
};

export type FPutObjectParamsWithoutCB = Omit<
  FPutObjectParamsWithCB,
  'callback'
>;

export type RemoveObjectParamsWithCB = {
  bucketName: string;
  objectName: string;
  removeOpts?: Record<string, any>;
  callback: (err: any) => void;
};

export type RemoveObjectParamsWithoutCB = Omit<
  RemoveObjectParamsWithCB,
  'callback'
>;

export default interface IBaseObjectStorage {
  makeBucket(this: any, params: MakeBucketParamsWithCB): void;

  makeBucket(this: any, params: MakeBucketParamsWithNoCB): Promise<void>;

  listBuckets(this: any): Promise<Array<{ name: string; creationDate: Date }>>;

  bucketExists(this: any, params: BucketExistsParamsWithCB): boolean;

  bucketExists(this: any, params: BucketExistsParamsWithoutCB): boolean;

  listObjects(this: any, params: ListObjectsParams): Stream;

  listObjectsV2(this: any, params: ListObjectV2Params): Stream;

  getObject(this: any, params: GetObjectParamsWithCB): void;

  getObject(this: any, params: GetObjectParamsWithoutCB): Promise<Stream>;

  fGetObject(this: any, params: FGetObjectParamsWithCB): void;

  fGetObject(this: any, params: FGetObjectParamsWithoutCB): Promise<void>;

  putObject(this: any, params: PutObjectParamsWithCB): void;

  putObject(this: any, params: PutObjectParamsWithoutCB): Promise<any>;

  fPutObject(this: any, params: FPutObjectParamsWithCB): void;

  fPutObject(this: any, params: FPutObjectParamsWithoutCB): Promise<any>;

  removeObject(this: any, params: RemoveObjectParamsWithCB): void;

  removeObject(this: any, params: RemoveObjectParamsWithoutCB): Promise<void>;
}
