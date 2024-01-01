import IJob from 'App/interfaces/job/job.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import { Job } from 'bullmq';
import { Bull } from 'Main/jobs';
import process from 'node:process';
import { parentPort } from 'node:worker_threads';

export default class DiscountJob implements IJob {
  readonly key = 'DISCOUNT_JOB';

  async handler() {
    try {
      console.log('CHECKING DISCOUNT SCHEDULER');
      const DiscountRepository = global.datasource.getRepository('discounts');
      const discounts = await DiscountRepository.createQueryBuilder('discount')
        .where(`discount.status = 'active'`)
        .andWhere(`DATE(discount.end_date, 'localtime') <= DATE('now', 'localtime')`)
        .getMany();

      for await (const discount of discounts) {
        const { title } = discount;

        await Bull(
          'NOTIF_JOB',
          {
            title: `A discount is expired`,
            description: `A discount named ${title} is expired now`,
            link: null,
            is_system_generated: true,
            status: 'UNSEEN',
            type: 'ERROR',
          }
        );
      }

      await DiscountRepository.save(
        discounts.map((discount) => ({
          ...discount,
          status: 'expired',
        }))
      );

      parentPort?.postMessage('done');
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async onComplete(job: Job<any, IResponse<any>, string>): Promise<void> {
    console.log('JOB COMPLETED');
    await job?.remove?.();
  }

  async onFail(
    job: Job<any, IResponse<any>, string> | undefined,
    error: Error,
    prev: string
  ): Promise<void> {
    console.log('DISCOUNT JOB ERROR: ', error);
    process.exit(0);
  }
}
