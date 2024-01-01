import ItemDTO from 'App/data-transfer-objects/item.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import handleError from 'App/modules/error-handler.module';
import validator from 'App/modules/validator.module';
import BrandRepository from 'App/repositories/brand.repository';
import CategoryRepository from 'App/repositories/category.repository';
import DiscountRepository from 'App/repositories/discount.repository';
import ImageRepository from 'App/repositories/image.repository';
import ItemRepository from 'App/repositories/item.repository';
import SupplierRepository from 'App/repositories/supplier.repository';
import { Item } from 'Main/database/models/item.model';
import { Bull } from 'Main/jobs';

export default class ItemDeleteEvent implements IEvent {
  public channel: string = 'item:update';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | ItemDTO | any>
  > {
    try {
      const { user } = eventData;
      const id = eventData.payload[0];
      const itemUpdate: Item = eventData.payload[1];
      const requesterHasPermission = user.hasPermission?.('update-item');

      if (requesterHasPermission) {
        const item = await ItemRepository.findOneByOrFail({
          id,
        });

        const updatedItem = ItemRepository.merge(item, itemUpdate);
        const errors = await validator(updatedItem);

        console.log(itemUpdate);
        if (errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        if (itemUpdate?.image_id) {
          updatedItem.image = await ImageRepository.findOneByOrFail({
            id: itemUpdate.image_id,
          });
        } else {
          updatedItem.image = undefined;
        }

        if (itemUpdate?.supplier_id) {
          updatedItem.supplier = await SupplierRepository.findOneByOrFail({
            id: itemUpdate.supplier_id,
          });
        } else {
          updatedItem.supplier = undefined;
        }

        if (itemUpdate.discount_id) {
          const discount = await DiscountRepository.findOneByOrFail({
            id: itemUpdate.discount_id
          });
          updatedItem.discount = discount;
        } else {
          updatedItem.discount = undefined;
        }

        updatedItem.brand = await BrandRepository.findOneByOrFail({
          id: itemUpdate.brand_id,
        });
        updatedItem.category = await CategoryRepository.findOneByOrFail({
          id: itemUpdate.category_id,
        });

        const data = await ItemRepository.save(updatedItem);

        await Bull('AUDIT_JOB', {
          user_id: user.id as number,
          resource_id: id.toString(),
          resource_table: 'items',
          resource_id_type: 'uuid',
          action: 'update',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully updated an Item`,
        });

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_id: id.toString(),
        resource_table: 'items',
        resource_id_type: 'uuid',
        action: 'update',
        status: 'FAILED',
        description: `User ${user.fullName} has failed to update an Item`,
      });

      return {
        errors: ['You are not allowed to update an Item'],
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
