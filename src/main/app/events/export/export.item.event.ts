/* eslint-disable no-continue */
/* eslint-disable react-hooks/rules-of-hooks */
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IExportResult from 'App/interfaces/transaction/export/export.result.interface';
import concatDateToName from 'App/modules/concat-date-to-name.module';
import handleError from 'App/modules/error-handler.module';
import { app } from "electron";
import { Bull } from 'Main/jobs';
import xlsx from 'xlsx';
import ItemRepository from 'App/repositories/item.repository';

export default class ExportItemEvent implements IEvent {
  public channel: string = 'item:export';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IExportResult | any>
  > {
    try {
      const { user } = eventData;
      const payload = eventData.payload[0];
      const requesterHasPermission =
        eventData.user.hasPermission?.('download-data');

      if (requesterHasPermission) {
        const itemQuery = ItemRepository.createQueryBuilder('item');

        if (payload instanceof Object && !(payload instanceof Array)) {
          // eslint-disable-next-line no-restricted-syntax
          for (const [propertyName, propertyFind] of Object.entries(payload)) {
            if (!(propertyFind as any)?.length) continue;

            if (propertyFind instanceof Array) {
              itemQuery
                .andWhere(`item.${propertyName} IN (:...${propertyName})`)
                .setParameter(propertyName, propertyFind);

            } else {
              itemQuery
                .andWhere(`item.${propertyName} LIKE :${propertyName}`)
                .setParameter(propertyName, `%${propertyFind}%`);
            }
          }
        }

        const items = await itemQuery
          .getMany();

        const extractedTransaction = items.map((item) => {
          return ({
            'Device ID': item.system_id,
            'Item Number': item.item_code,
            'Batch Number': item.batch_code,
            'SKU': item.sku?.length ? item.sku : '—',
            'Item Name': item.name,
            'Barcode': item.barcode?.length ? item.barcode : '—',
            'Status': item.status,
            'Quantity': item.stock_quantity,
            'UM': item.unit_of_measurement,
            'Supplier': item.supplier?.name ?? '—',
            'Brand': item.brand.name,
            'Category': item.category.name,
            'Expiry Date': new Date(item.expired_at).toLocaleDateString(),
            'Date Created': new Date(item.created_at).toLocaleDateString(),
          })
        });

        const name = items?.length === 1
          ? items[0].item_code.toLowerCase() + '_'
          : 'products';

        const fileName = app.getPath('downloads') + `/${
          concatDateToName(`xgen_${name}`)
        }.xlsx`;

        const worksheet = xlsx.utils.json_to_sheet(extractedTransaction);
        const workbook = xlsx.utils.book_new();

        xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');
        xlsx.writeFile(workbook, fileName);

        await Bull('AUDIT_JOB', {
          user_id: user.id as unknown as string,
          resource_id: null,
          resource_table: 'items',
          resource_id_type: null,
          action: 'export',
          status: 'SUCCEEDED',
          description: `User ${
            user.fullName
          } has successfully exported products as spread-sheet`,
        });

        return {
          data: { filePath: fileName },
          code: 'REQ_OK',
          status: 'SUCCESS',
        };;
      }

      return {
        errors: ['You are not allowed to export product records'],
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
