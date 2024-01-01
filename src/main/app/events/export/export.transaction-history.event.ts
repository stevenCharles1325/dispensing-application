/* eslint-disable no-continue */
/* eslint-disable react-hooks/rules-of-hooks */
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import ITransactionSpreadSheet from 'App/interfaces/transaction/export/spreadsheet.transaction.interface';
import handleError from 'App/modules/error-handler.module';
import exportAsSpreadsheet from 'App/modules/export/transaction/export-as-spreadsheet.module';
import exportAsSQL from 'App/modules/export/transaction/export-as-sql.module';

export default class ExportTransactionHistoryEvent implements IEvent {
  public channel: string = 'transaction-history:export';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | ITransactionSpreadSheet | any>
  > {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('download-data');

      if (requesterHasPermission) {
        const exportFormat = eventData.payload[0] as 'SQL' | 'SPREADSHEET';
        const recordType: 'WHOLE' | 'CURRENT:DAY' | 'CURRENT:MONTH' | 'CURRENT:YEAR' =
          eventData.payload[1] ?? 'WHOLE';


        switch (exportFormat) {
          case 'SPREADSHEET':
            return await exportAsSpreadsheet(recordType) as IResponse<any>;

          case 'SQL':
            return await exportAsSQL() as IResponse<any>;

          default:
            return {
              errors: [`Invalid exporting format`],
              code: 'REQ_INVALID',
              status: 'ERROR',
            };
        }
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
