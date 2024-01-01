import DiscountDTO from 'App/data-transfer-objects/discount.dto';
import ItemDTO from 'App/data-transfer-objects/item.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import DiscountRepository from 'App/repositories/discount.repository';
import ItemRepository from 'App/repositories/item.repository';
import { Bull } from 'Main/jobs';
import { In } from "typeorm"

export default class DiscountUpdateEvent implements IEvent {
  public channel: string = 'discount:update';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | DiscountDTO | any>
  > {
    try {
      const { user } = eventData;
      const id = eventData.payload[0];
      const itemIds: ItemDTO['id'][] = eventData.payload[1];
      const requesterHasPermission = user.hasPermission?.('update-discount');

      if (requesterHasPermission) {
        const discount = await DiscountRepository.findOneByOrFail({ id });
        const items = await ItemRepository.createQueryBuilder()
          .where({
            id: In(itemIds),
          })
          .getMany();

        await Bull('AUDIT_JOB', {
          user_id: user.id as unknown as string,
          resource_id: id.toString(),
          resource_table: 'discounts',
          resource_id_type: 'uuid',
          action: 'update',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully updated a discount`,
        });

        if (discount?.items?.length) {
          const attachedItemsId = discount.items.map(({ id }) => id);

          /* ===================================
          + Filter all attached items that are
          + not in the items list.
          ======================================*/
          const toBeDetachedItemsId = attachedItemsId.filter(({ id }) => {
            return !items.includes(id);
          });

          const toBeDetachedItems = await ItemRepository.createQueryBuilder()
            .where({
              id: In(toBeDetachedItemsId),
            })
            .getMany();

          await ItemRepository.save(toBeDetachedItems.map((item) => {
            item.discount = null;
            return item;
          }));
        }

        if (items?.length) {
          await ItemRepository.save(items.map((item) => {
            item.discount = discount;
            return item;
          }));
        }

        return {
          data: discount,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof discount>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as unknown as string,
        resource_id: id.toString(),
        resource_table: 'discounts',
        resource_id_type: 'uuid',
        action: 'update',
        status: 'FAILED',
        description: `User ${user.fullName} has failed to update a discount`,
      });

      return {
        errors: ['You are not allowed to update a discount'],
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
