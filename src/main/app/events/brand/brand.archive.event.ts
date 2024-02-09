import BrandDTO from 'App/data-transfer-objects/brand.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import { Brand } from 'Main/database/models/brand.model';
import { SqliteDataSource } from 'Main/datasource';
import { Bull } from 'Main/jobs';

export default class BrandArchiveEvent implements IEvent {
  public channel: string = 'brand:archive';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | any>
  > {
    try {
      // Copy these
      const { user } = eventData;
      const id: Brand['id'] = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.('archive-brand');

      if (requesterHasPermission) {
        const brandRepo = SqliteDataSource.getRepository(Brand);
        const data = await brandRepo.softDelete(id); // Change this

        // Copy these
        await Bull('AUDIT_JOB', {
          user_id: user.id as string,
          resource_id: id.toString(),
          resource_table: 'brands', // Change this
          resource_id_type: 'uuid', // Watchout for this
          action: 'archive',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully archived a Brand`, // Change this
        });

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      // Copy these
      await Bull('AUDIT_JOB', {
        user_id: user.id as unknown as string,
        resource_table: 'brands', // Change this
        action: 'archive',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to archive a Brand`, // Change this
      });

      return {
        errors: ['You are not allowed to archive a Brand'],
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
