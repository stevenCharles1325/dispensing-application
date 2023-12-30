/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import DiscountDTO from 'App/data-transfer-objects/discount.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import { Discount } from 'Main/database/models/discount.model';
import { SqliteDataSource } from 'Main/datasource';
import { Bull } from 'Main/jobs';

export default class DiscountDeleteEvent implements IEvent {
  public channel: string = 'discount:delete';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | any>
  > {
    try {
      // Copy these
      const { user } = eventData;
      const payload: Discount['id'] = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.('delete-discount');

      if (requesterHasPermission) {
        const discountRepo = SqliteDataSource.getRepository(Discount);
        const data = await discountRepo.delete(payload);

        // Copy these
        if (Array.isArray(payload)) {
          for await (const id of payload) {
            await Bull('AUDIT_JOB', {
              user_id: user.id as number,
              resource_id: id.toString(),
              resource_table: 'discounts',
              resource_id_type: 'integer',
              action: 'delete',
              status: 'SUCCEEDED',
              description: `User ${user.fullName} has successfully deleted a Discount`,
            });
          }
        } else {
          await Bull('AUDIT_JOB', {
            user_id: user.id as number,
            resource_id: payload.toString(),
            resource_table: 'discounts',
            resource_id_type: 'integer',
            action: 'delete',
            status: 'SUCCEEDED',
            description: `User ${user.fullName} has successfully deleted a Discount`,
          });
        }

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_table: 'discounts',
        action: 'delete',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to delete a Discount`,
      });

      return {
        errors: ['You are not allowed to delete a Discount'],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as unknown as IResponse<string[]>;
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      if (error?.code === 19 || error.message?.includes('FOREIGN KEY')) {
        return {
          errors: ['cannot delete a discount that has attached product'],
          code: 'SYS_ERR',
          status: 'ERROR',
        } as unknown as IResponse<IPOSError[]>;
      }

      return {
        errors: [error],
        code: 'SYS_ERR',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
