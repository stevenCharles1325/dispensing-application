import { Job } from 'bullmq';
import IResponse from '../pos/pos.response.interface';
import AuditTrailDTO from 'App/data-transfer-objects/audit-trail.dto';

export default interface IJob {
  readonly key: string;
  handler(this: any, job: Job | any): Promise<any>;
  onProgress?(
    this: any,
    job: Job<any, IResponse<any>, string>,
    progress: number | object
  ): Promise<void>;
  onComplete?(
    this: any,
    job: Job<any, IResponse<any>, string>,
    result: any,
    prev: string,
  ): Promise<void>;
  onFail?(
    this: any,
    job: Job<any, IResponse<any>, string> | undefined,
    error: Error,
    prev: string
  ): Promise<void>;
}
