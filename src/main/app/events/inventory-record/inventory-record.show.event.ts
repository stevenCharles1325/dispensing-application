/* eslint-disable no-continue */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-else-return */
import InventoryRecordDTO from 'App/data-transfer-objects/inventory-record.dto';
import usePagination from 'App/hooks/pagination.hook';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import InventoryRecordRepository from 'App/repositories/inventory-record.repository';

export default class InventoryRecordEvent implements IEvent {
  public channel: string = 'inventory-record:show';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IPagination<InventoryRecordDTO> | any>
  > {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('view-stock-record');

      if (requesterHasPermission) {
        const payload = eventData.payload[0] ?? 'all';
        const page = eventData.payload[1] || 1; // Page
        const take = eventData.payload[2] || 15; // Total
        const skip = (page - 1) * take;

        const recordQuery = InventoryRecordRepository.createQueryBuilder(
          'record'
        ).leftJoinAndSelect('record.item', 'item');

        if (take !== 'max') {
          recordQuery.take(take).skip(skip);
        }

        if (payload === 'all') {
          return await usePagination(recordQuery, page);
        }

        if (payload instanceof Object && !(payload instanceof Array)) {
          // eslint-disable-next-line no-restricted-syntax
          for (const [propertyName, propertyFind] of Object.entries(payload)) {
            if (!(propertyFind as any)?.length) continue;

            if (propertyFind instanceof Array) {
              recordQuery
                .where(`record.${propertyName} IN (:...${propertyName})`)
                .setParameter(propertyName, propertyFind);
            } else {
              recordQuery
                .where(`record.${propertyName} LIKE :${propertyName}`)
                .setParameter(propertyName, `%${propertyFind}%`);
            }
          }

          return await usePagination(recordQuery, page);
        }

        return {
          errors: ['The query argument must be an Object'],
          code: 'REQ_INVALID',
          status: 'ERROR',
        } as unknown as IResponse<string[]>;
      }

      return {
        errors: ['You are not allowed to view a Stock-record'],
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
