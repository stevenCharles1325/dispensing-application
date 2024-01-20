import IEvent from "App/interfaces/event/event.interface";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IResponse from "App/interfaces/pos/pos.response.interface";
import handleError from "App/modules/error-handler.module";
import IEventListenerProperties from "App/interfaces/event/event.listener-props.interface";
import TransactionDTO from "App/data-transfer-objects/transaction.dto";
import TransactionRepository from "App/repositories/transaction.repository";
import SystemRepository from "App/repositories/system.repository";
import getTemplate from "App/modules/printer/get-template.module";
import { mainWindow } from "Main/main";

export default class PrinterPrintEvent implements IEvent {
  public channel: string = 'printer:print';

  public middlewares = ['auth.v2.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | void | any>
  > {
    try {
      const { user } = eventData;
      const transactionId: TransactionDTO['id'] = eventData.payload[0];
      const transaction = await TransactionRepository.createQueryBuilder()
        .where({
          id: transactionId
        })
        .getOneOrFail();
      const system = await SystemRepository.createQueryBuilder()
        .where({
          id: transaction.system_id,
        })
        .getOneOrFail();


      const result = await mainWindow?.webContents.getPrintersAsync();
      const printer = result?.find((printer) => printer.isDefault);

      const requesterHasPermission = user.hasPermission?.('download-data');

      if (requesterHasPermission && user.hasSystemKey) {
        const data = getTemplate({
          store_name: system.store_name,
          item_code: transaction.orders[0].item.item_code,
          batch_code: transaction.orders[0].item.batch_code,
          tare_weight: transaction.tare_weight,
          net_weight: transaction.net_weight,
          gross_weight: transaction.gross_weight,
          product_lot_number: transaction.product_lot_number,
          product_used: transaction.product_used,
          created_at: transaction.created_at,
          transaction_code: transaction.transaction_code,
        });

        const option = {
          preview: true,
          margin: '1 1 1 1',
          copies: 1,
          printerName: printer?.displayName,
          timeOutPerLine: 400,
          pageSize: '58mm',
        }

        const res = await PosPrinter.print(data, option);

        console.log('PRINT: ', res);
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
