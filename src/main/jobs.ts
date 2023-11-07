/* eslint-disable no-restricted-syntax */
import { join } from 'path';
import requireAll from 'App/modules/require-all.module';
import { Queue, Worker } from 'bullmq';
import objectToFlattenArray from 'App/modules/object-to-flatten-array.module';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IJob from 'App/interfaces/job/job.interface';
import AuditTrailDTO from 'App/data-transfer-objects/audit-trail.dto';
import { Redis } from 'ioredis';

const QUEUE_NAME = 'main';

const connection = new Redis();
const jobsObject = requireAll(require.context('./app/jobs', true, /\.(js|ts|json)$/));
const queue = new Queue(QUEUE_NAME, { connection });

const jobs: Record<string, IJob> = {};

type BullData = Omit<AuditTrailDTO, 'id' | 'user' | 'related' | 'created_at'>;

export async function Bull(jobName: string, data: BullData) {
  await queue.add(jobName, data);
  const job = jobs[jobName];
  const worker = new Worker<any, IResponse<any>>(QUEUE_NAME, job.handler);

  if (job?.onProgress) worker.on('progress', job.onProgress);
  if (job?.onComplete) worker.on('completed', job.onComplete);
  if (job?.onFail) worker.on('failed', job.onFail);
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
