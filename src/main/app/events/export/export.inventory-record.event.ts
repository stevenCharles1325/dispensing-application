/* eslint-disable no-continue */
/* eslint-disable react-hooks/rules-of-hooks */
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import ITransactionSpreadSheet from 'App/interfaces/transaction/export/spreadsheet.transaction.interface';
import concatDateToName from 'App/modules/concatDateToName.module';
import handleError from 'App/modules/error-handler.module';
import InventoryRecordRepository from 'App/repositories/inventory-record.repository';
import { app } from "electron";
import { Bull } from 'Main/jobs';
import xlsx from 'xlsx';

export default class ExportInventoryRecordsEvent implements IEvent {
  public channel: string = 'inventory-records:export';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | ITransactionSpreadSheet | any>
  > {
    try {
      const { user } = eventData;
      const requesterHasPermission =
        eventData.user.hasPermission?.('download-data');

      const fileName = app.getPath('downloads') + `/${
        concatDateToName(`xgen_stocks_records`)
      }.xlsx`;

      if (requesterHasPermission) {
        const records = await InventoryRecordRepository.createQueryBuilder('transaction')
          .getMany();

        const extractedTransaction = records.map((record) => {
          return ({
            'Item ID': record.item.item_code,
            'Item Name': record.item.name,
            Purpose: record.purpose,
            Note: record.note,
            Quantity: record.quantity,
            'Created By': record.creator.fullName(),
            'Creator Email': record.creator.email,
            'Date Created': new Date(record.created_at).toLocaleDateString(),
          })
        });

        const worksheet = xlsx.utils.json_to_sheet(extractedTransaction);
        const workbook = xlsx.utils.book_new();

        xlsx.utils.book_append_sheet(workbook, worksheet, 'Stocks-records');
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
          } has successfully exported stocs-records as spread-sheet`,
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
