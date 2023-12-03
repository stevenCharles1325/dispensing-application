import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import validator from 'App/modules/validator.module';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import { Bull } from 'Main/jobs';
import { InventoryRecord } from 'Main/database/models/inventory-record.model';
import InventoryRecordRepository from 'App/repositories/inventory-record.repository';
import InventoryRecordDTO from 'App/data-transfer-objects/inventory-record.dto';
import ItemRepository from 'App/repositories/item.repository';
import UserRepository from 'App/repositories/user.repository';

export default class InventoryRecordCreateEvent implements IEvent {
  public channel: string = 'inventory-record:create';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | InventoryRecordDTO | any>
  > {
    try {
      const { user } = eventData;
      const payload: InventoryRecord = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.('create-stock-record');

      if (requesterHasPermission && user.id) {
        console.log(payload);
        const item = await ItemRepository.findOneByOrFail({ id: payload.item_id });
        const creator = await UserRepository.findOneByOrFail({ id: user.id });

        const record = InventoryRecordRepository.create(payload);
        const errors = await validator(record);

        if (errors && errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        if (record.type === 'stock-out' && item.stock_quantity - record.quantity < 0) {
          return {
            errors: [
              {
                field: 'quantity',
                message: 'Product quantity will be negative',
              }
            ],
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        record.item = item as any;
        record.creator = creator as any;

        if (record.type === 'stock-in') {
          item.stock_quantity += record.quantity;
        }

        if (record.type === 'stock-out') {
          item.stock_quantity -= record.quantity;
        }

        await ItemRepository.save(item);

        const data = (
          await InventoryRecordRepository.save(record)
        ) as unknown as InventoryRecordDTO;

        await Bull('AUDIT_JOB', {
          user_id: user.id as number,
          resource_id: data.id.toString(),
          resource_table: 'inventory-record',
          resource_id_type: 'integer',
          action: 'create',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully created a new Stocks-record`,
        });

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_table: 'inventory-record',
        action: 'create',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to create a new Stocks-record`,
      });

      return {
        errors: ['You are not allowed to create a Stocks-record'],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as unknown as IResponse<string[]>;
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        code: 'SYS_ERR',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
