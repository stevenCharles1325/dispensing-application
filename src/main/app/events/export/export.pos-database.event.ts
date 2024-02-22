/* eslint-disable no-continue */
/* eslint-disable react-hooks/rules-of-hooks */
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IExportResult from 'App/interfaces/transaction/export/export.result.interface';
import handleError from 'App/modules/error-handler.module';
import exportSQL from 'App/modules/export/pos/export.pos.module';
import importSQL from 'App/modules/import/pos/import.pos.module';
import { Bull } from 'Main/jobs';

export default class ExportPOSDatabaseEvent implements IEvent {
  public channel: string = 'pos-database:export';

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

      if (requesterHasPermission) {
        const res = await exportSQL();

        if (res.status === 'ERROR') {
          return {
            errors: res.errors,
            code: 'REQ_ERR',
            status: 'ERROR',
          };
        }

        await Bull('AUDIT_JOB', {
          user_id: user.id as unknown as string,
          resource_id: null,
          resource_table: null,
          resource_id_type: null,
          action: 'export',
          status: 'SUCCEEDED',
          description: `User ${
            user.fullName
          } has successfully backed-up the database`,
        });

        return {
          data: res.data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        };
      }

      return {
        errors: ['You are not allowed to back-up the database'],
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
