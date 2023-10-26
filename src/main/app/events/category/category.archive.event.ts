import CategoryDTO from 'App/data-transfer-objects/category.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import { Category } from 'Main/database/models/category.model';
import { SqliteDataSource } from 'Main/datasource';
import { Bull } from 'Main/jobs';

export default class CategoryArchiveEvent implements IEvent {
  public channel: string = 'category:archive';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | any>
  > {
    try {
      const { user } = eventData;
      const id: CategoryDTO['id'] | Category['id'] = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.('archive-category');

      if (requesterHasPermission) {
        const categoryRepo = SqliteDataSource.getRepository(Category);
        const data = await categoryRepo.softDelete(id);

        await Bull('AUDIT_JOB', {
          user_id: user.id as number,
          resource_id: id.toString(),
          resource_table: 'categories',
          resource_id_type: 'integer',
          action: 'archive',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully archived a Category`,
        });

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_table: 'categories',
        action: 'archive',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to archive a Category`,
      });

      return {
        errors: ['You are not allowed to archive a Category'],
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
