/* eslint-disable no-restricted-syntax */
import requireAll from 'App/modules/require-all.module';
import { Queue, Worker, Job } from 'bullmq';
import objectToFlattenArray from 'App/modules/object-to-flatten-array.module';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IJob from 'App/interfaces/job/job.interface';
import AuditTrailDTO from 'App/data-transfer-objects/audit-trail.dto';
import { Redis } from 'ioredis';
import { getPlatform } from './binaries';

const QUEUE_NAME = 'main';

const os = getPlatform();
const connection = new Redis();

connection.on('connect', () => {
  console.log('IOREDIS IS CONNECTED');
});

connection.on('error', (err) => {
  console.log('IOREDIS ERROR: ', err);
  connection.disconnect();
});

const jobsObject = requireAll(require.context('./app/jobs', true, /\.(js|ts|json)$/));
const queue = new Queue(QUEUE_NAME, { connection });

const jobs: Record<string, IJob> = {};

export type BullData = Omit<AuditTrailDTO, 'id' | 'user' | 'related' | 'created_at'>;

export async function Bull(this: any, jobName: string, data: BullData) {
  const job = jobs[jobName];

  if (os === 'win' || os === 'mac') {
    try {
      const result = await job.handler(data);

      if (job?.onComplete) job.onComplete(job as unknown as Job, result, '');
    } catch (err) {
      if (job?.onFail) job.onFail(job as unknown as Job, err as Error, '');
    }
  }

  if (os === 'linux') {
    await queue.add(jobName, data);
    const worker = new Worker<any, IResponse<any>>(QUEUE_NAME, job.handler);

    if (job?.onProgress) worker.on('progress', job.onProgress);
    if (job?.onComplete) worker.on('completed', job.onComplete);
    if (job?.onFail) worker.on('failed', job.onFail);
  }
}

export default function () {
  try {
    console.log('[JOBS]: Initializing jobs');
    if (jobsObject) {
      const flattenJobs = objectToFlattenArray(jobsObject);

      for (const [_, JobClass] of flattenJobs) {
        const job: IJob = new JobClass();

        jobs[job.key] = job;
      }
    }
    console.log('[JOBS]: Jobs initialized successfully');
  } catch (err) {
    console.log('[JOBS-ERROR]: ', err);
    throw err;
  }
}
