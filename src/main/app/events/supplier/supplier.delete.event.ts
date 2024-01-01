/* eslint-disable no-restricted-syntax */
import SupplierDTO from 'App/data-transfer-objects/supplier.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import { Supplier } from 'Main/database/models/supplier.model';
import { SqliteDataSource } from 'Main/datasource';
import { Bull } from 'Main/jobs';

export default class SupplierDeleteEvent implements IEvent {
  public channel: string = 'supplier:delete';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | any>
  > {
    try {
      const { user } = eventData;
      const payload: SupplierDTO['id'] = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.('delete-supplier');

      if (requesterHasPermission) {
        const supplierRepo = SqliteDataSource.getRepository(Supplier);
        const data = await supplierRepo.delete(payload);

        if (Array.isArray(payload)) {
          for await (const id of payload) {
            await Bull('AUDIT_JOB', {
              user_id: user.id as unknown as string,
              resource_id: id,
              resource_table: 'suppliers',
              resource_id_type: 'uuid',
              action: 'delete',
              status: 'SUCCEEDED',
              description: `User ${user.fullName} has successfully deleted a Supplier`,
            });
          }
        } else {
          await Bull('AUDIT_JOB', {
            user_id: user.id as unknown as string,
            resource_id: payload,
            resource_table: 'suppliers', // Change this
            resource_id_type: 'uuid',
            action: 'delete',
            status: 'SUCCEEDED',
            description: `User ${user.fullName} has successfully deleted a Supplier`,
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
        resource_table: 'suppliers',
        action: 'delete',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to delete a Supplier`,
      });

      return {
        errors: ['You are not allowed to delete a Supplier'],
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
