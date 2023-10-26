import SupplierDTO from 'App/data-transfer-objects/supplier.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import { Supplier } from 'Main/database/models/supplier.model';
import { SqliteDataSource } from 'Main/datasource';
import { Bull } from 'Main/jobs';

export default class SupplierArchiveEvent implements IEvent {
  public channel: string = 'supplier:archive';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | any>
  > {
    try {
      const { user } = eventData;
      const id: Supplier['id'] = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.('archive-supplier');

      if (requesterHasPermission) {
        const supplierRepo = SqliteDataSource.getRepository(Supplier);
        const data = await supplierRepo.softDelete(id);

        await Bull('AUDIT_JOB', {
          user_id: user.id as number,
          resource_id: id.toString(),
          resource_table: 'suppliers',
          resource_id_type: 'integer',
          action: 'archive',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully archived a Supplier`,
        });

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_table: 'suppliers',
        action: 'archive',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to archive a Supplier`,
      });

      return {
        errors: ['You are not allowed to archive a Supplier'],
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
