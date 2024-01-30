import InventoryRecordDTO from 'App/data-transfer-objects/inventory-record.dto';
import UploadDataDTO from 'App/data-transfer-objects/upload-data.dto';
import IJob from 'App/interfaces/job/job.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import concatDateToName from 'App/modules/concatDateToName.module';
import handleError from 'App/modules/error-handler.module';
import { Job } from 'bullmq';
import { app } from 'electron';
import { Bull } from 'Main/jobs';
import process from 'node:process';
import { parentPort } from 'node:worker_threads';
import xlsx from 'xlsx';

export default class InventoryRecordImportJob implements IJob {
  readonly key = 'INVENTORY_RECORD_IMPORT_JOB';

  async handler({ data }: Job) {
    try {
      const InventoryRecordRepository =
        global.datasource.getRepository('inventory_records');
      const ItemRepository = global.datasource.getRepository('items');
      const UserRepository = global.datasource.getRepository('users');
      const UploadDataRepository = global.datasource.getRepository('upload_datas');

      const {
        chunk,
        isDone,
        uploadId,
      } = data;

      const queryRunner = global.datasource.createQueryRunner();

      for await (const record of chunk) {
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const systemID = record['Device ID'];

        const item = await ItemRepository.createQueryBuilder()
          .where({
            item_code: record['Item ID'],
            name: record['Item Name'],
          })
          .getOne();

        const user = await UserRepository.createQueryBuilder()
          .where({
            email: record['Creator Email'],
          })
          .getOne();

        if (!item) {
          record['Error'] = "Item does not exist, please create the item manually first.";
        }

        if (!user) {
          record['Error'] = "User does not exist, please create the user manually first.";
        }

        if (item?.system_id === systemID && user?.system_id === systemID) {
          record['Error'] = "This record came from this device, and might cause conflict.";
        }

        const uploadData: Omit<UploadDataDTO, 'id' | 'created_at' | 'upload'> = {
          upload_id: uploadId,
          content: JSON.stringify(record),
          status: record['Error'] ? 'error' : 'success',
        }

        await queryRunner.manager.save(uploadData);

        if (record['Error']) continue;

        if (item && user) {
          const inventoryRecord: Omit<
            InventoryRecordDTO,
            'id' | 'creator' | 'item'
          > = {
            purpose: record['Purpose'],
            item_id: item.id,
            note: record['Note'],
            type: record['Type'],
            quantity: record['Quantity'],
            creator_id: user.id,
            created_at: record['Date Created'],
          }

          if (inventoryRecord.type === 'stock-in') {
            item.stock_quantity += inventoryRecord.quantity;
          }

          if (inventoryRecord.type === 'stock-out') {
            item.stock_quantity -= inventoryRecord.quantity;
          }

          try {
            await ItemRepository.save(item);
            await InventoryRecordRepository.save(inventoryRecord);
            await queryRunner.commitTransaction();
          } catch (err) {
            const error = handleError(err);

            record['Error'] = error;
            await queryRunner.rollbackTransaction();
          }
        }

        await queryRunner.release();
      }

      if (isDone) {
        const uploadChunks = await UploadDataRepository.createQueryBuilder()
          .where({
            upload_id: uploadId,
            status: 'error',
          })
          .getMany();

        const result = uploadChunks.reduce((prev: Record<string, any>[], { content }) => {
          return [...prev, JSON.parse(content)]
        }, []);

        if (result.length) {
          const fileName = app.getPath('downloads') + `/${
            concatDateToName(`xgen_stock_records_import_errors`)
          }.xlsx`;

          const worksheet = xlsx.utils.json_to_sheet(result);
          const workbook = xlsx.utils.book_new();

          xlsx.utils.book_append_sheet(workbook, worksheet, 'Stock-records');
          xlsx.writeFile(workbook, fileName);

          await Bull(
            'NOTIF_JOB',
            {
              title: `Errors from imported Stock-records`,
              description: `Errors was save to "${fileName}"`,
              link: null,
              is_system_generated: true,
              status: 'UNSEEN',
              type: 'ERROR',
            }
          );
        }
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
    console.log('INVENTORY RECORD IMPORT JOB ERROR: ', error);
    process.exit(0);
  }
}
