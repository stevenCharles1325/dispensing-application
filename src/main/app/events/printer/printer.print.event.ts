import IEvent from "App/interfaces/event/event.interface";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IResponse from "App/interfaces/pos/pos.response.interface";
import handleError from "App/modules/error-handler.module";
import IEventListenerProperties from "App/interfaces/event/event.listener-props.interface";
import IPrinterService from "App/interfaces/service/service.printer.interface";
import Provider from "@IOC:Provider";
import { IPrintReceiptData } from "App/interfaces/pos/pos.printer.receipt.interface";

export default class PrinterPrintEvent implements IEvent {
  public channel: string = 'printer:print';

  public middlewares = ['auth.v2.middleware'];

  public async listener({
    event,
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | void | any>
  > {
    try {
      const { user } = eventData;
      const printerService = Provider.ioc<IPrinterService>(
        'PrinterProvider'
      );
      const printData: IPrintReceiptData = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.('download-data');

      if (requesterHasPermission || user.hasSystemKey) {
        await printerService.print(printData);
      }

      return {
        code: 'REQ_OK',
        status: 'SUCCESS',
      }
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', err);

      return {
        errors: [error],
        code: 'REQ_ERR',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
