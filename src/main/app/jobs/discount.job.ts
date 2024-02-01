import IJob from 'App/interfaces/job/job.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import { Job } from 'bullmq';
import { Bull } from 'Main/jobs';
import process from 'node:process';
import { parentPort } from 'node:worker_threads';
import { In } from "typeorm"

export default class DiscountJob implements IJob {
  readonly key = 'DISCOUNT_JOB';

  async handler() {
    try {
      console.log('CHECKING DISCOUNT SCHEDULER');
      const DiscountRepository = global.datasource.getRepository('discounts');
      const ItemRepository = global.datasource.getRepository('items');

      const discounts = await DiscountRepository.createQueryBuilder('discount')
        .where(`discount.status = 'active'`)
        .andWhere(`DATE(discount.end_date, 'localtime') = DATE('now', 'localtime')`)
        .getMany();
      const discountIds = discounts.map(({ id }) => id);

      const items = await ItemRepository.createQueryBuilder('items')
        .where({
          discount_id: In(discountIds),
        })
        .getMany();

      const updatedItems = items.map((item) => ({
        id: item.id,
        discount_id: null,
      })) as any[];

      await ItemRepository.save(updatedItems);

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
      console.log('ERROR:  ', error);
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
