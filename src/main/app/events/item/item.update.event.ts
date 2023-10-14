import ItemDTO from 'App/data-transfer-objects/item.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import handleError from 'App/modules/error-handler.module';
import validator from 'App/modules/validator.module';
import ItemRepository from 'App/repositories/item.repository';
import { Item } from 'Main/database/models/item.model';

export default class ItemDeleteEvent implements IEvent {
  public channel: string = 'item:update';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | ItemDTO | any>
  > {
    try {
      const id = eventData.payload[0];
      const itemUpdate = eventData.payload[1];

      const requesterHasPermission =
        eventData.user.hasPermission?.('update-item');

      if (requesterHasPermission) {
        const item = await ItemRepository.findOneByOrFail({
          id,
        });
        const updatedItem = ItemRepository.merge(item, itemUpdate);
        const errors = await validator(updatedItem);

        if (errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        console.log(updatedItem);
        const data = await ItemRepository.save(updatedItem);
        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

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
