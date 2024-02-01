import IEvent from "App/interfaces/event/event.interface";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IResponse from "App/interfaces/pos/pos.response.interface";
import handleError from "App/modules/error-handler.module";
import IEventListenerProperties from "App/interfaces/event/event.listener-props.interface";
import TransactionDTO from "App/data-transfer-objects/transaction.dto";
import TransactionRepository from "App/repositories/transaction.repository";
import { getTemplateV2 } from "App/modules/printer/get-template.module";
import IPrinterService from "App/interfaces/service/service.printer.interface";
import Provider from "@IOC:Provider";

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
      const htmlString = eventData.payload[0];

      // const webContents = event.sender;
      // webContents.focus();
      // const result = await webContents.getPrintersAsync();
      // const printer = result?.find((printer) => printer.isDefault);

      const requesterHasPermission = user.hasPermission?.('download-data');

      if (requesterHasPermission || user.hasSystemKey) {
        // const option: PosPrintOptions = {
        //   preview: false,
        //   boolean: true,
        //   silent: true,
        //   copies: 1,
        //   printerName: printer?.displayName,
        //   timeOutPerLine: 5000,
        //   pageSize: '58mm',
        // }

        // const res = await PosPrinter.print(data, option);
        await printerService.print(htmlString);
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
