/* eslint-disable no-restricted-syntax */
import CategoryDTO from 'App/data-transfer-objects/category.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import { Category } from 'Main/database/models/category.model';
import { SqliteDataSource } from 'Main/datasource';
import { Bull } from 'Main/jobs';

export default class CategoryDeleteEvent implements IEvent {
  public channel: string = 'category:delete';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | any>
  > {
    try {
      const { user } = eventData;
      const payload: Category['id'] = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.('delete-category');

      if (requesterHasPermission) {
        const categoryRepo = SqliteDataSource.getRepository(Category);
        const data = await categoryRepo.delete(payload);

        if (Array.isArray(payload)) {
          for await (const id of payload) {
            await Bull('AUDIT_JOB', {
              user_id: user.id as unknown as string,
              resource_id: id.toString(),
              resource_table: 'categories',
              resource_id_type: 'uuid',
              action: 'delete',
              status: 'SUCCEEDED',
              description: `User ${user.fullName} has successfully deleted a Category`,
            });
          }
        } else {
          await Bull('AUDIT_JOB', {
            user_id: user.id as unknown as string,
            resource_id: payload.toString(),
            resource_table: 'categories',
            resource_id_type: 'uuid',
            action: 'delete',
            status: 'SUCCEEDED',
            description: `User ${user.fullName} has successfully deleted a Category`,
          });
        }

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as unknown as string,
        resource_table: 'categories',
        action: 'delete',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to delete a Category`,
      });

      return {
        errors: ['You are not allowed to delete a Category'],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as unknown as IResponse<string[]>;
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      if (error?.code === 19) {
        return {
          errors: ['cannot delete a category that has attached product'],
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
