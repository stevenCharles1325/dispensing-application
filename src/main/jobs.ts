/* eslint-disable no-restricted-syntax */
import requireAll from 'App/modules/require-all.module';
import { Queue, Worker, Job } from 'bullmq';
import objectToFlattenArray from 'App/modules/object-to-flatten-array.module';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IJob from 'App/interfaces/job/job.interface';
import { Redis } from 'ioredis';
import { getPlatform } from 'App/modules/get-platform.module';
import { join } from 'path';

const IS_PROD = process.env.NODE_ENV === 'production';
const QUEUE_NAME = 'main';

const os = getPlatform();
const connection = new Redis();

connection.on('connect', () => {
  console.log('IOREDIS IS CONNECTED');
  connection.disconnect();
});

connection.on('error', (err) => {
  console.log('IOREDIS ERROR: ', err);
  connection.disconnect();
});

const jobsObject = requireAll(
  IS_PROD
    ? require?.context?.('./app/jobs', true, /\.(js|ts|json)$/)
    : join(__dirname, 'app/jobs')
);

const queue = new Queue(QUEUE_NAME, { connection });

const jobs: Record<string, IJob> = {};

export async function Bull(this: any, jobName: string, data: any) {
  const job = jobs[jobName];

  /* ============================================================
    Since in Windows there is a lot of things to setup before we
    can start using Redis, I decided not to use it on windows
    and mac as Redis is primarily supported on Linux.

    But if linux failed to connect to Redis we have a fallback
    process.
    =============================================================
  */
  if (os === 'win' || os === 'mac') {
    try {
      const result = await job.handler({ data });

      console.log(result);
      if (job?.onComplete) job.onComplete(job as unknown as Job, result, '');
    } catch (err) {
      if (job?.onFail) job.onFail(job as unknown as Job, err as Error, '');
    }
  }

  if (os === 'linux') {
    try {
      await queue.add(jobName, data);
      const worker = new Worker<any, IResponse<any>>(QUEUE_NAME, job.handler);

      if (job?.onProgress) worker.on('progress', job.onProgress);
      if (job?.onComplete) worker.on('completed', job.onComplete);
      if (job?.onFail) worker.on('failed', job.onFail);
    } catch (err) {
      console.log('JOB ERROR: ', err);

      try {
        const result = await job.handler({ data });

        if (job?.onComplete) job.onComplete(job as unknown as Job, result, '');
      } catch (err) {
        if (job?.onFail) job.onFail(job as unknown as Job, err as Error, '');
      }
    }
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
