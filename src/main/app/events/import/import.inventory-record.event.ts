/* eslint-disable no-continue */
/* eslint-disable react-hooks/rules-of-hooks */
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IExportResult from 'App/interfaces/transaction/export/export.result.interface';
import chunkImport from 'App/modules/chunk-import.module';
import handleError from 'App/modules/error-handler.module';
import { Bull } from 'Main/jobs';

const excelToJson = require('convert-excel-to-json');

export default class ImportInventoryRecordEvent implements IEvent {
  public channel: string = 'inventory-record:import';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IExportResult | any>
  > {
    try {
      const { user } = eventData;
      const requesterHasPermission =
        eventData.user.hasPermission?.('upload-data');

      if (requesterHasPermission) {
        const filePath = eventData.payload[0] as string;

        const result = await excelToJson({
          sourceFile: filePath,
          columnToKey: {
            '*': '{{columnHeader}}'
          }
        });

        const list = result['Stock-records'].slice(1);

        await chunkImport(
          list,
          {
            filePath,
            processorName: 'INVENTORY_RECORD_IMPORT_JOB'
          }
        );

        await Bull('AUDIT_JOB', {
          user_id: user.id as unknown as string,
          resource_id: null,
          resource_table: 'inventory_records',
          resource_id_type: null,
          action: 'import',
          status: 'SUCCEEDED',
          description: `User ${
            user.fullName
          } has successfully imported a stock records`,
        });

        return {
          data: [],
          code: 'REQ_OK',
          status: 'SUCCESS',
        };
      }

      return {
        errors: ['You are not allowed to import stock records'],
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
