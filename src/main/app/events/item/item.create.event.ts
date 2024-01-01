import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import validator from 'App/modules/validator.module';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import ItemRepository from 'App/repositories/item.repository';
import ItemDTO from 'App/data-transfer-objects/item.dto';
import { Item } from 'Main/database/models/item.model';
import { Bull } from 'Main/jobs';
import DiscountRepository from 'App/repositories/discount.repository';

export default class ItemCreateEvent implements IEvent {
  public channel: string = 'item:create';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | ItemDTO | any>
  > {
    try {
      const { user } = eventData;
      const payload: Item = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.('create-item');

      if (requesterHasPermission) {
        const item = ItemRepository.create(payload);
        const errors = await validator(item);

        console.log(item);
        if (errors && errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        if (item.discount_id) {
          const discount = await DiscountRepository.findOneByOrFail({
            id: item.discount_id
          });
          item.discount = discount;
        }

        const data = (await ItemRepository.save(item)) as unknown as ItemDTO;

        await Bull('AUDIT_JOB', {
          user_id: user.id as number,
          resource_id: data.id.toString(),
          resource_table: 'items',
          resource_id_type: 'uuid',
          action: 'create',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully created a new Item`,
        });

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_table: 'items',
        action: 'create',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to create a new Item`,
      });

      return {
        errors: ['You are not allowed to create an Item'],
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
