import IEvent from "App/interfaces/event/event.interface";
import IEventListenerProperties from "App/interfaces/event/event.listener-props.interface";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IResponse from "App/interfaces/pos/pos.response.interface";
import concatDateToName from "App/modules/concat-date-to-name.module";
import handleError from "App/modules/error-handler.module";
import htmlToPDF from "App/modules/html-to-pdf.module";
import { Bull } from "Main/jobs";
import { app } from "electron";
import fs from 'fs';

export default class PDFDownloadEvent implements IEvent {
  public channel: string = 'pdf:download';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | any>
  > {
    try {
      const { user } = eventData;
      const pdfFileName: string = eventData.payload[0]
      const pdfContent: string = eventData.payload[1];
      const requesterHasPermission = user.hasPermission?.(
        'download-data'
      );

      const htmlPath = `${app.getPath('documents')}/${concatDateToName(pdfFileName)}.html`;
      const pdfPath = `${app.getPath('documents')}/${concatDateToName(pdfFileName)}.pdf`;

      if (requesterHasPermission && user.id) {
        fs.writeFileSync(htmlPath, pdfContent);

        if (fs.existsSync(htmlPath)) {
          await htmlToPDF(htmlPath, pdfPath);
          fs.unlinkSync(htmlPath);
        } else {
          return {
            errors: ['File to be converted to PDF is missing'],
            code: 'REQ_ERR',
            status: 'ERROR',
          } as unknown as IResponse<string[]>;
        }

        await Bull('AUDIT_JOB', {
          user_id: user.id as unknown as string,
          resource_table: 'transactions',
          resource_id_type: 'uuid',
          action: 'TRANSACT',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully performed a transaction`,
        });

        return {
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<null>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as unknown as string,
        resource_table: 'transactions',
        action: 'payment',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to receive a customer payment`,
      });

      return {
        errors: ['You are not allowed to create a Payment'],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as unknown as IResponse<string[]>;
    } catch (err) {
      const errors = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', errors);

      return {
        errors: [errors],
        code: 'SYS_ERR',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
