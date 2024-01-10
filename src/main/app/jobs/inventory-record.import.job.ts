import InventoryRecordDTO from 'App/data-transfer-objects/inventory-record.dto';
import UploadChunkDTO from 'App/data-transfer-objects/upload-chunk.dto';
import IJob from 'App/interfaces/job/job.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import concatDateToName from 'App/modules/concatDateToName.module';
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
      const UploadChunkRepository = global.datasource.getRepository('upload_chunks');

      const {
        chunk,
        isDone,
        uploadId,
      } = data;

      const errored = [];

      for await (const record of chunk) {
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
          record['Error'] = "Item does not exist, please create the item manually first";
          errored.push(record);

          continue;
        }

        if (!user) {
          record['Error'] = "User does not exist, please create the user manually first";
          errored.push(record);

          continue;
        }

        if (item.system_id === systemID && user.system_id === systemID) {
          record['Error'] = "This record came from this device, and might cause conflict";
          errored.push(record);

          continue;
        }

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

        await ItemRepository.save(item);
        await InventoryRecordRepository.save(inventoryRecord);
      }

      if (errored.length) {
        const stringifyErrors = JSON.stringify(errored);

        const uploadChunk: Omit<UploadChunkDTO, 'id' | 'created_at'> = {
          upload_id: uploadId,
          content: stringifyErrors,
        }

        await UploadChunkRepository.save(uploadChunk);
      }

      if (isDone) {
        const uploadChunks = await UploadChunkRepository.createQueryBuilder()
          .where({
            upload_id: uploadId,
          })
          .getMany();

        const result = uploadChunks.reduce((prev: Record<string, any>[], { content }) => {
          return [...prev, ...JSON.parse(content)]
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
