/* eslint-disable no-restricted-syntax */
import ItemDTO from 'App/data-transfer-objects/item.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import { Item } from 'Main/database/models/item.model';
import { SqliteDataSource } from 'Main/datasource';
import { Bull } from 'Main/jobs';

export default class ItemDeleteEvent implements IEvent {
  public channel: string = 'item:delete';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | any>
  > {
    try {
      const { user } = eventData;
      const payload: ItemDTO['id'] | Item['id'] = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.('delete-item');

      if (requesterHasPermission) {
        const itemRepo = SqliteDataSource.getRepository(Item);
        const data = await itemRepo.delete(payload);

        if (Array.isArray(payload)) {
          for await (const id of payload) {
            await Bull('AUDIT_JOB', {
              user_id: user.id as number,
              resource_id: id.toString(),
              resource_table: 'items',
              resource_id_type: 'uuid',
              action: 'delete',
              status: 'SUCCEEDED',
              description: `User ${user.fullName} has successfully deleted an Item`,
            });
          }
        } else {
          await Bull('AUDIT_JOB', {
            user_id: user.id as number,
            resource_id: payload.toString(),
            resource_table: 'items',
            resource_id_type: 'uuid',
            action: 'delete',
            status: 'SUCCEEDED',
            description: `User ${user.fullName} has successfully deleted a Brand`,
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
        resource_table: 'items',
        action: 'delete',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to delete an Item`,
      });

      return {
        errors: ['You are not allowed to delete an Item'],
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
