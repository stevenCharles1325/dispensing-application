/* eslint-disable consistent-return */
import IObjectStorageAdaptor from 'App/interfaces/adaptor/object-storage/adaptor.object-storage.interface';
import {
  BucketExistsParamsWithCB,
  BucketExistsParamsWithoutCB,
  FGetObjectParamsWithCB,
  FPutObjectParamsWithCB,
  FPutObjectParamsWithoutCB,
  GetObjectParamsWithCB,
  GetObjectParamsWithoutCB,
  ListObjectV2Params,
  ListObjectsParams,
  MakeBucketParamsWithCB,
  MakeBucketParamsWithNoCB,
  PutObjectParamsWithCB,
  PutObjectParamsWithoutCB,
  RemoveObjectParamsWithCB,
  RemoveObjectParamsWithoutCB,
} from 'App/interfaces/pos/pos.base-object-storage.interface';
import MinioConfig from 'Main/config/minio.config';
import { ResultCallback } from 'minio/dist/main/internal/type';
import { Stream } from 'stream';

const Minio = require('minio');

const {
  Client,
  MakeBucketOpt,
  RemoveOptions,
  UploadedObjectInfo,
  NoResultCallback,
} = Minio;

export class MinioAdaptor implements Partial<IObjectStorageAdaptor> {
  public readonly client: typeof Client;

  constructor(public readonly config: typeof MinioConfig) {
    this.client = new Minio.Client({
      endPoint: config.object_storage_endpoint,
      port: config.object_storage_port,
      accessKey: config.object_storage_access_key,
      secretKey: config.object_storage_secret_key,
    });
  }

  makeBucket(
    params: MakeBucketParamsWithCB | MakeBucketParamsWithNoCB
  ): Promise<void> | void | any {
    if ('callback' in params) {
      const { bucketName, region = 'us-east-1', makeOpts, callback } = params;

      this.client.makeBucket(
        bucketName,
        region,
        makeOpts as typeof MakeBucketOpt,
        callback as typeof NoResultCallback
      );
    } else {
      const { bucketName, region = 'us-east-1', makeOpts } = params;

      return this.client.makeBucket(
        bucketName,
        region,
        makeOpts as typeof MakeBucketOpt
      );
    }
  }

  listBuckets(): Promise<Array<{ name: string; creationDate: Date }>> {
    return this.client.listBuckets();
  }

  bucketExists(
    params: BucketExistsParamsWithCB | BucketExistsParamsWithoutCB
  ): void | Promise<boolean> | any {
    if ('callback' in params) {
      const { bucketName, callback } = params;

      this.client.bucketExists(bucketName, callback);
    } else {
      const { bucketName } = params;

      return this.client.bucketExists(bucketName);
    }
  }

  listObjects(params: ListObjectsParams): Stream {
    const { bucketName, prefix, recursive } = params;
    return this.client.listObjects(bucketName, prefix, recursive);
  }

  listObjectsV2(params: ListObjectV2Params): Stream {
    const { bucketName, prefix, recursive, startAfter } = params;
    return this.client.listObjectsV2(bucketName, prefix, recursive, startAfter);
  }

  getObject(
    params: GetObjectParamsWithCB | GetObjectParamsWithoutCB
  ): Promise<Stream> | void | any {
    if ('callback' in params) {
      const { bucketName, objectName, callback } = params;
      this.client.getObject(bucketName, objectName, callback);
    } else {
      const { bucketName, objectName } = params;
      return this.client.getObject(bucketName, objectName);
    }
  }

  fGetObject(params: FGetObjectParamsWithCB): void | Promise<void> | any {
    if ('callback' in params) {
      const { bucketName, objectName, filePath, callback } = params;

      this.client.fGetObject(bucketName, objectName, filePath, callback);
    } else {
      const { bucketName, objectName, filePath } = params;

      return this.client.fGetObject(bucketName, objectName, filePath);
    }
  }

  putObject(
    params: PutObjectParamsWithCB | PutObjectParamsWithoutCB
  ): void | Promise<void> | any {
    if ('callback' in params) {
      const { bucketName, objectName, stream, size, metaData, callback } =
        params;
      this.client.putObject(
        bucketName,
        objectName,
        stream,
        size,
        metaData,
        callback as ResultCallback<typeof UploadedObjectInfo>
      );
    } else {
      const { bucketName, objectName, stream, size, metaData } = params;
      return this.client.putObject(
        bucketName,
        objectName,
        stream,
        size,
        metaData
      );
    }
  }

  fPutObject(
    params: FPutObjectParamsWithCB | FPutObjectParamsWithoutCB
  ): Promise<typeof UploadedObjectInfo> | void | any {
    if ('callback' in params) {
      const { bucketName, objectName, filePath, metaData, callback } = params;
      this.client.fPutObject(
        bucketName,
        objectName,
        filePath,
        metaData,
        callback as ResultCallback<typeof UploadedObjectInfo>
      );
    } else {
      const { bucketName, objectName, filePath, metaData } = params;
      return this.client.fPutObject(bucketName, objectName, filePath, metaData);
    }
  }

  removeObject(
    params: RemoveObjectParamsWithCB | RemoveObjectParamsWithoutCB
  ): Promise<void> | void | any {
    if ('callback' in params) {
      const { bucketName, objectName, removeOpts, callback } = params;
      this.client.removeObject(
        bucketName,
        objectName,
        removeOpts as typeof RemoveOptions,
        callback
      );
    } else {
      const { bucketName, objectName, removeOpts } = params;
      return this.client.removeObject(
        bucketName,
        objectName,
        removeOpts as typeof RemoveOptions
      );
    }
  }
}
