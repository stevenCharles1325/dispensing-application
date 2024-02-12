import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import UploadDataDTO from 'App/data-transfer-objects/upload-data.dto';
import UserDTO from 'App/data-transfer-objects/user.dto';
import IJob from 'App/interfaces/job/job.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import concatDateToName from 'App/modules/concat-date-to-name.module';
import handleError from 'App/modules/error-handler.module';
import getUOFSymbol from 'App/modules/get-uof-symbol.module';
import unitQuantityCalculator from 'App/modules/unit-quantity-calculator.module';
import { Job } from 'bullmq';
import { app } from 'electron';
import { InventoryRecord } from 'Main/database/models/inventory-record.model';
import { Item } from 'Main/database/models/item.model';
import { UploadData } from 'Main/database/models/upload-data.model';
import { Upload } from 'Main/database/models/upload.model';
import { Bull } from 'Main/jobs';
import process from 'node:process';
import { parentPort } from 'node:worker_threads';
import { capitalize } from 'lodash';
import validator from 'App/modules/validator.module';
import xlsx from 'xlsx';

export default class InventoryRecordImportJob implements IJob {
  readonly key = 'INVENTORY_RECORD_IMPORT_JOB';

  async handler({ data }: Job) {
    const queryRunner = global.datasource.createQueryRunner();

    try {
      const {
        chunk,
        total,
        fileName,
        isLastChunk,
        uploadId,
      } = data;

      await queryRunner.connect();

      const createUploadData = async (
        record: Record<string, any>,
        status: 'error' | 'success' | null | undefined = null
      ) => {
        if (status) {
          const uploadData = new UploadData();
          uploadData.upload_id = uploadId;
          uploadData.content = JSON.stringify(record);
          uploadData.status = record['Error'] ? 'error' : status;

          await queryRunner.manager.save(uploadData);

          return uploadData;
        }
      }

      const updateUploadStatusCount = async (
        record: Record<string, any>,
        status: 'error' | 'success' = 'error'
      ) => {
        const upload = (await queryRunner.query(
          `SELECT * FROM uploads WHERE id = '${uploadId}'`
        ))?.[0];
        const uploadData = await createUploadData(record, status);

        if (!uploadData) return;
        if (uploadData.status === 'error') {
          upload.error_count += 1;
        } else {
          upload.success_count += 1;
        }

        await queryRunner.manager.save(Upload, upload as unknown as Upload);
      }

      const validate = async (data: object, record: Record<string, any>) => {
        const errors = await validator(data) as IPOSValidationError[];

        if (errors && errors.length) {
          if (queryRunner.isTransactionActive) {
            await queryRunner.rollbackTransaction();
            await queryRunner.startTransaction();
          }

          record['Error'] = errors
            .map(({ field, message }) =>
              capitalize(`${field} ${message}`?.toLocaleLowerCase())
            )
            .join(', ') + '.';

          await updateUploadStatusCount(record, 'error');
          await queryRunner.commitTransaction();
        }
      }

      const validationField = async (record: Record<string, any>) => {
        const requiredColumns = [
          'Device ID',
          'Item Name',
          'Item Number',
          'Batch Number',
          'Creator Email',
          'Quantity',
          'Purpose',
          'Type',
          'Date Created',
          'UM'
        ];

        const errors = [];
        for (const column of requiredColumns) {
          if (!(column in record)) {
            errors.push(`"${column}" column is missing`);
          }
        }

        if (errors.length) {
          record['Error'] = errors.join(', ') + '.';
        }
      }

      const progress = (await queryRunner.query(
        `SELECT
          COUNT(*) as processed,
          SUM(status = 'success') as success_count,
          SUM(status = 'error') as error_count
        FROM upload_datas
        WHERE upload_id = '${uploadId}'
      `))?.[0];

      let processed = progress.processed ?? 0;
      let successCount = progress.success_count ?? 0;
      let errorCount = progress.error_count ?? 0;

      global.emitToRenderer('PROGRESS:DATA', {
        message: `Uploading ${fileName} with (${successCount}) succeeded and (${errorCount}) failed`,
        progress: (processed / total) * 100,
      });

      for await (const record of chunk) {
        await queryRunner.startTransaction();
        processed += 1;

        record['Error'] = undefined;

        await validationField(record);

        if (record['Error']) {
          errorCount += 1;
          await updateUploadStatusCount(record, 'error');
          await queryRunner.commitTransaction();
          continue;
        }

        const item = (await queryRunner.query(
          `SELECT *
          FROM items
          WHERE item_code = '${record['Item Number']}'
          AND name = '${record['Item Name']}'
          AND batch_code = '${record['Batch Number']}'
        `))?.[0] as Item;
        const user = (await queryRunner.query(
          `SELECT *
          FROM users
          WHERE email = '${record['Creator Email']}'
        `))?.[0] as UserDTO;

        const systemID = record['Device ID'];

        if (!item) {
          record['Error'] = "Item does not exist, please create the item manually first.";
        }

        if (!user) {
          record['Error'] = "User does not exist, please create the user manually first.";
        }

        if (item?.system_id === systemID && user?.system_id === systemID) {
          record['Error'] = "This record came from this device, and might cause conflict.";
        }

        if (record['Error']) {
          errorCount += 1;
          await updateUploadStatusCount(record, 'error');
          await queryRunner.commitTransaction();
          continue;
        };

        if (item && user) {
          const itemClone = new Item();
          const inventoryRecord = new InventoryRecord();

          inventoryRecord.purpose = record['Purpose'];
          inventoryRecord.item_id = item.id;
          inventoryRecord.note = record['Note'];
          inventoryRecord.type = record['Type']?.toLocaleLowerCase();
          inventoryRecord.quantity = record['Quantity'];
          inventoryRecord.unit_of_measurement = record['UM']?.toLocaleLowerCase();
          inventoryRecord.creator_id = user.id;
          inventoryRecord.created_at = record['Date Created'];

          Object.assign(itemClone, item);

          const leftOperand = {
            quantity: itemClone.stock_quantity,
            unit: itemClone.unit_of_measurement,
          }
          const rightOperand = {
            quantity: inventoryRecord.quantity,
            unit: inventoryRecord.unit_of_measurement,
          }

          try {
            const [quantity, um] = unitQuantityCalculator(
              leftOperand,
              rightOperand,
              getUOFSymbol,
              inventoryRecord.type?.toLocaleLowerCase() === 'stock-in' ? 'add' : 'sub',
            );

            itemClone.stock_quantity = quantity;
            itemClone.unit_of_measurement = um;

            await validate(itemClone, record);
            await validate(inventoryRecord, record);

            if (record['Error']) {
              errorCount += 1;
              await queryRunner.commitTransaction();
              continue;
            };

            await queryRunner.manager.save(itemClone);
            await queryRunner.manager.save(inventoryRecord);
            await updateUploadStatusCount(record, 'success');
            await queryRunner.commitTransaction();

            successCount += 1;
          } catch (err) {
            const error = handleError(err);

            errorCount += 1;
            record['Error'] = error?.message ?? error;

            await queryRunner.rollbackTransaction();
            await queryRunner.startTransaction();

            await updateUploadStatusCount(record, 'error');
            await queryRunner.commitTransaction();
          }
        }
      }

      if (isLastChunk) {
        await queryRunner.startTransaction();

        const erroredRows = (await queryRunner.query(
          `SELECT *
          FROM upload_datas
          WHERE upload_id = '${uploadId}' AND status = 'error'
          `)) as UploadDataDTO[];

        const uploadClone = new Upload();
        const upload = (await queryRunner.query(
          `SELECT * FROM uploads WHERE id = '${uploadId}'`
          ))?.[0];

        Object.assign(uploadClone, {
          ...upload,
          status: erroredRows.length ? 'failed' : 'successful'
        });

        await queryRunner.manager.save(uploadClone);
        await queryRunner.commitTransaction();

        const result = erroredRows.reduce((prev: Record<string, any>[], { content }) => {
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

      global.emitToRenderer('PROGRESS:DATA', {
        message: `Uploading ${fileName} with (${successCount}) succeeded and (${errorCount}) failed`,
        progress: ((isLastChunk ? total : processed) / total) * 100,
      });

      parentPort?.postMessage('done');
    } catch (error) {
      console.log('ERROR:  ', error);
      return Promise.reject(error);
    } finally {
      await queryRunner.release();
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
