import IJob from 'App/interfaces/job/job.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import { Job } from 'bullmq';
import { Bull } from 'Main/jobs';
import process from 'node:process';
import { parentPort } from 'node:worker_threads';

export default class ExpirationJob implements IJob {
  readonly key = 'EXPIRATION_JOB';

  async handler() {
    try {
      console.log('CHECKING EXPIRATION SCHEDULER');
      const ItemRepository = global.datasource.getRepository('items');

      const items = await ItemRepository.createQueryBuilder('item')
        .where(`item.status = 'active'`)
        .andWhere(`DATE(item.expired_at, 'localtime') = DATE('now', 'localtime')`)
        .getMany();

      const updatedItems = items.map((item) => ({
        ...item,
        status: 'expired',
      })) as any[];

      await ItemRepository.save(updatedItems);

      for await (const item of items) {
        const { name } = item;

        await Bull(
          'NOTIF_JOB',
          {
            title: `An item is expired`,
            description: `An item named ${name} is expired now`,
            link: null,
            is_system_generated: true,
            status: 'UNSEEN',
            type: 'ERROR',
          }
        );
      }

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
