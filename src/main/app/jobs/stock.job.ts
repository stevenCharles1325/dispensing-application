import IJob from 'App/interfaces/job/job.interface';
import validator from 'App/modules/validator.module';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import { Job } from 'bullmq';
import { InventoryRecord } from 'Main/database/models/inventory-record.model';
import { Item } from 'Main/database/models/item.model';
import { User } from 'Main/database/models/user.model';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import Provider from '@IOC:Provider';

export default class StockJob implements IJob {
  readonly key = 'STOCK_JOB';

  async handler({ data }: Job) {
    try {
      const authService = Provider.ioc<IAuthService>('AuthProvider');
      const authUser = authService.getAuthUser();

      const ItemRepository = global.datasource.getRepository('items');
      const item = await ItemRepository.findOneBy({ id: data.item_id }) as Item;

      const UserRepository = global.datasource.getRepository('users');
      const user = await UserRepository.findOneBy({ id: authUser.id }) as User;

      const InventoryRecordRepository = global.datasource.getRepository('inventory_records')
      const record = InventoryRecordRepository.create(data) as unknown as InventoryRecord;

      const errors = await validator(record);
      if (errors && errors.length) {
        return Promise.reject(errors);
      }

      record.creator = user;
      record.item = item;
      return await InventoryRecordRepository.save(record);
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
    console.log('STOCK JOB ERROR: ', error);
  }
}
