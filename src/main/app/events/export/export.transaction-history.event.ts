/* eslint-disable no-continue */
/* eslint-disable react-hooks/rules-of-hooks */
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IExportResult from 'App/interfaces/transaction/export/export.result.interface';
import handleError from 'App/modules/error-handler.module';
import exportAsSpreadsheet from 'App/modules/export/transaction/export-as-spreadsheet.module';
import exportAsSQL from 'App/modules/export/transaction/export-as-sql.module';
import { Bull } from 'Main/jobs';

export default class ExportTransactionHistoryEvent implements IEvent {
  public channel: string = 'transaction-history:export';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IExportResult | any>
  > {
    try {
      const { user } = eventData;
      const requesterHasPermission =
        eventData.user.hasPermission?.('download-data');

      let exporteRes = null;

      if (requesterHasPermission) {
        const exportFormat = eventData.payload[0] as 'SQL' | 'SPREADSHEET';
        const recordType: 'WHOLE' | 'CURRENT:DAY' | 'CURRENT:MONTH' | 'CURRENT:YEAR' =
          eventData.payload[1] ?? 'WHOLE';

        switch (exportFormat) {
          case 'SPREADSHEET':
            exporteRes = await exportAsSpreadsheet(recordType) as IResponse<any>;
            break;

          case 'SQL':
            exporteRes = await exportAsSQL() as IResponse<any>;
            break;

          default:
            return {
              errors: [`Invalid exporting format`],
              code: 'REQ_INVALID',
              status: 'ERROR',
            };
        }

        await Bull('AUDIT_JOB', {
          user_id: user.id as unknown as string,
          resource_id: null,
          resource_table: 'transactions',
          resource_id_type: null,
          action: 'export',
          status: 'SUCCEEDED',
          description: `User ${
            user.fullName
          } has successfully exported transaction-history as ${
            exportFormat.toLocaleLowerCase()
          }`,
        });

        return exporteRes;
      }

      return {
        errors: ['You are not allowed to export transaction history'],
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
