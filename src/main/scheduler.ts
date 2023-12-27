import schedule from 'node-schedule';
import { Bull } from './jobs';
import ICronJob from 'App/interfaces/cron/cron.jobs.interface';

const atEveryDay = '0 0 * * *';
// const atEveryFiveSeconds = '5 * * * * *';

const cronJobs: ICronJob[] = [
  {
    label: 'CRON:EVERY-DAY',
    schedule: atEveryDay,
    callback: async () => {
      await Bull('DISCOUNT_JOB', {});
    }
  },
]

cronJobs.forEach((job: ICronJob) => {
  console.log(`RUNNING "${job.label}" CRON JOB`);
  schedule.scheduleJob(job.schedule, job.callback);
});

export default cronJobs;
