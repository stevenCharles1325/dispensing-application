import { Job } from 'bullmq';
import IResponse from '../pos/pos.response.interface';

export default interface IJob {
  readonly key: string;
  handler(this: any, job: Job): Promise<any>;
  onProgress?(
    this: any,
    job: Job<any, IResponse<any>, string>,
    progress: number | object
  ): Promise<void>;
  onComplete?(
    this: any,
    job: Job<any, IResponse<any>, string>,
    progress: number | object
  ): Promise<void>;
  onFail?(
    this: any,
    job: Job<any, IResponse<any>, string> | undefined,
    error: Error,
    prev: string
  ): Promise<void>;
}
