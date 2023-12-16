import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import validator from 'App/modules/validator.module';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import { Bull } from 'Main/jobs';
import { Discount } from 'Main/database/models/discount.model';
import DiscountDTO from 'App/data-transfer-objects/discount.dto';
import DiscountRepository from 'App/repositories/discount.repository';
import ItemDTO from 'App/data-transfer-objects/item.dto';
import ItemRepository from 'App/repositories/item.repository';
import { In } from "typeorm"

export default class DiscountCreateEvent implements IEvent {
  public channel: string = 'discount:create';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | DiscountDTO | any>
  > {
    try {
      const { user } = eventData;
      const payload: Discount = eventData.payload[0];
      const itemIds: ItemDTO['id'][] = eventData.payload[1];
      const requesterHasPermission = user.hasPermission?.('create-discount');

      if (requesterHasPermission) {
        payload.creator_id = user.id as number;
        const discount = DiscountRepository.create(payload);
        const items = await ItemRepository.createQueryBuilder()
          .where({
            id: In(itemIds),
          })
          .getMany();
        const errors = await validator(discount);

        if (errors && errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        if (items?.length) {
          await ItemRepository.save(items.map((item) => {
            item.discount = discount;
            return item;
          }));
        }

        const data: Discount = await DiscountRepository.save(discount);

        await Bull('AUDIT_JOB', {
          user_id: user.id as number,
          resource_id: data.id.toString(),
          resource_table: 'discounts',
          resource_id_type: 'integer',
          action: 'create',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully created a new Discount`,
        });

        console.log('CREATED A DISCOUNT');
        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      // Copy this
      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_table: 'discounts', // Change this
        action: 'create',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to create a new Discount`, // Change this
      });

      return {
        errors: ['You are not allowed to create a Discount'],
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
