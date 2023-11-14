/* eslint-disable no-continue */
/* eslint-disable react-hooks/rules-of-hooks */
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import OrderRepository from 'App/repositories/order.repository';
import { Order } from 'Main/database/models/order.model';
import { app } from 'electron';
import xlsx from 'xlsx';

export default class ExportTransactionHistoryEvent implements IEvent {
  public channel: string = 'transaction-history:export';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | null | any>
  > {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('download-data');

      if (requesterHasPermission) {
        const payload: 'WHOLE' | 'CURRENT:DAY' | 'CURRENT:MONTH' | 'CURRENT:YEAR' =
          eventData.payload[0] ?? 'WHOLE';

        const orderQuery = OrderRepository.createQueryBuilder('order');
        const category = payload.split(':')
          .map((word) => word.toLowerCase())
          .join('_');

        console.log(category);
        const fileName = app.getPath('downloads') + `/xgen_${category}_transaction.xlsx`;
        console.log(fileName);

        let query: string | null = null;
        let orders: Order[] | null = null;

        switch (payload) {
          case 'CURRENT:DAY':
            query = `date(order.created_at) = date('now')`;
            break;

          case 'CURRENT:MONTH':
            query = `strftime('%m', date(order.created_at)) = strftime('%m', date('now'))`;
            break;

          case 'CURRENT:YEAR':
            query = `strftime('%Y', date(order.created_at)) = strftime('%Y', date('now'))`;
            break;

          default:
            break;
        }

        if (query) {
          orders = await orderQuery.where(query).getMany();
        } else {
          orders = await orderQuery.getMany();
        }

        if (orders) {
          const extractedOrders = orders.map((order) => ({
            Product: order.item.name,
            Price: order.price,
            Quantity: order.quantity,
            Total: order.quantity * order.price,
            'Date Sold': new Date(order.created_at).toLocaleDateString(),
          }));

          const worksheet = xlsx.utils.json_to_sheet(extractedOrders);
          const workbook = xlsx.utils.book_new();

          xlsx.utils.book_append_sheet(workbook, worksheet, 'Orders');
          return xlsx.writeFile(workbook, fileName)
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
