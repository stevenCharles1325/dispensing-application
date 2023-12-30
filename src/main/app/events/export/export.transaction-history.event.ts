/* eslint-disable no-continue */
/* eslint-disable react-hooks/rules-of-hooks */
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import ITransactionSpreadSheet from 'App/interfaces/transaction/export/spreadsheet.transaction.interface';
import handleError from 'App/modules/error-handler.module';
import getDiscount from 'App/modules/get-discount';
import TransactionRepository from 'App/repositories/transaction.repository';
import { Transaction } from 'Main/database/models/transaction.model';
import { app } from 'electron';
import xlsx from 'xlsx';

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
        const payload: 'WHOLE' | 'CURRENT:DAY' | 'CURRENT:MONTH' | 'CURRENT:YEAR' =
          eventData.payload[0] ?? 'WHOLE';

        const transactionQuery = TransactionRepository.createQueryBuilder('transaction');
        const category = payload.split(':')
          .map((word) => word.toLowerCase())
          .join('_');

        const fileName = app.getPath('downloads') + `/xgen_${category}_transaction.xlsx`;

        let query: string | null = null;
        let transactions: Transaction[] | null = null;

        switch (payload) {
          case 'CURRENT:DAY':
            query = `date(transaction.created_at) = date('now')`;
            break;

          case 'CURRENT:MONTH':
            query = `strftime('%m', date(transaction.created_at)) = strftime('%m', date('now'))`;
            break;

          case 'CURRENT:YEAR':
            query = `strftime('%Y', date(transaction.created_at)) = strftime('%Y', date('now'))`;
            break;

          default:
            break;
        }

        if (query) {
          transactions = await transactionQuery.where(query).getMany();
        } else {
          transactions = await transactionQuery.getMany();
        }

        if (transactions) {
          const extractedTransaction = transactions.map((transaction) => {
            const ordersQuantity = transaction.orders.reduce((prev, curr) => {
              return prev + curr.quantity;
            }, 0);

            const ordersTotal = transaction.orders.reduce((prev, curr) => {
              return prev + curr.price;
            }, 0);

            const { discount } = getDiscount(
              ordersTotal,
              transaction?.discount?.discount_type as any ?? null,
              transaction?.discount?.discount_value,
            );

            return ({
              Cashier: transaction.source_name,
              Customer: transaction.recipient_name,
              'Total Order Quantity': ordersQuantity,
              'Discount': discount,
              'Total Price': transaction.total,
              'Date Sold': new Date(transaction.created_at).toLocaleDateString(),
            })
          });

          if (!extractedTransaction.length) {
            return {
              errors: [`No transaction records`],
              code: 'REQ_INVALID',
              status: 'ERROR',
            };
          }

          const worksheet = xlsx.utils.json_to_sheet(extractedTransaction);
          const workbook = xlsx.utils.book_new();

          xlsx.utils.book_append_sheet(workbook, worksheet, 'Orders');
          xlsx.writeFile(workbook, fileName);

          return {
            data: { filePath: fileName },
            code: 'REQ_OK',
            status: 'SUCCESS',
          };
        }

        return {
          errors: ['The query argument must be an Object'],
          code: 'REQ_INVALID',
          status: 'ERROR',
        } as unknown as IResponse<string[]>;
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
