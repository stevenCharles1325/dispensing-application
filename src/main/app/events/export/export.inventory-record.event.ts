/* eslint-disable no-continue */
/* eslint-disable react-hooks/rules-of-hooks */
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IExportResult from 'App/interfaces/transaction/export/export.result.interface';
import concatDateToName from 'App/modules/concat-date-to-name.module';
import handleError from 'App/modules/error-handler.module';
import InventoryRecordRepository from 'App/repositories/inventory-record.repository';
import { app } from "electron";
import { Bull } from 'Main/jobs';
import xlsx from 'xlsx';
import { In } from "typeorm"

export default class ExportInventoryRecordsEvent implements IEvent {
  public channel: string = 'inventory-record:export';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IExportResult | any>
  > {
    try {
      const { user } = eventData;
      const ids = eventData.payload[0];
      const requesterHasPermission =
        eventData.user.hasPermission?.('download-data');

      if (requesterHasPermission) {
        const recordQuery = InventoryRecordRepository.createQueryBuilder('record');

        if (ids && ids.length) {
          recordQuery.where({
            item_id: In(ids)
          });
        }

        const records = await recordQuery
          .getMany();

        const extractedTransaction = records.map((record) => {
          return ({
            'Device ID': record.item.system_id,
            'Item ID': record.item.item_code,
            'Item Name': record.item.name,
            Purpose: record.purpose,
            Note: record.note,
            Type: record.type,
            Quantity: record.quantity,
            UM: record.unit_of_measurement,
            'Created By': `${record.creator.first_name} ${record.creator.last_name}`,
            'Creator Email': record.creator.email,
            'Date Created': new Date(record.created_at).toLocaleDateString(),
          })
        });

        const name = ids?.length === 1
          ? records[0].item.item_code.toLowerCase() + '_'
          : '';

        const fileName = app.getPath('downloads') + `/${
          concatDateToName(`xgen_${name}stock_records`)
        }.xlsx`;

        const worksheet = xlsx.utils.json_to_sheet(extractedTransaction);
        const workbook = xlsx.utils.book_new();

        xlsx.utils.book_append_sheet(workbook, worksheet, 'Stock-records');
        xlsx.writeFile(workbook, fileName);

        await Bull('AUDIT_JOB', {
          user_id: user.id as unknown as string,
          resource_id: null,
          resource_table: 'transactions',
          resource_id_type: null,
          action: 'export',
          status: 'SUCCEEDED',
          description: `User ${
            user.fullName
          } has successfully exported stock records as spread-sheet`,
        });

        return {
          data: { filePath: fileName },
          code: 'REQ_OK',
          status: 'SUCCESS',
        };;
      }

      return {
        errors: ['You are not allowed to export stocks records'],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as unknown as IResponse<string[]>;
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
