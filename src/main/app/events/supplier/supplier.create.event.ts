import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import SupplierRepository from 'App/repositories/supplier.repository';
import validator from 'App/modules/validator.module';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import SupplierDTO from 'App/data-transfer-objects/supplier.dto';
import { Supplier } from 'Main/database/models/supplier.model';
import { Bull } from 'Main/jobs';

export default class SupplierCreateEvent implements IEvent {
  public channel: string = 'supplier:create';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<
      string[] | IPOSError[] | IPOSValidationError[] | SupplierDTO | any
    >
  > {
    try {
      const { user } = eventData;
      const payload: Supplier = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.('create-supplier');

      if (requesterHasPermission) {
        const supplier = SupplierRepository.create(payload);
        const errors = await validator(supplier);

        if (errors && errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        const data: Supplier = await SupplierRepository.save(supplier);

        await Bull('AUDIT_JOB', {
          user_id: user.id as unknown as string,
          resource_id: data.id,
          resource_table: 'suppliers',
          resource_id_type: 'uuid',
          action: 'create',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully created a new Supplier`,
        });

        console.log('CREATED A CATEGORY');
        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as unknown as string,
        resource_table: 'suppliers',
        action: 'create',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to create a new Supplier`,
      });

      return {
        errors: ['You are not allowed to create a Supplier'],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as unknown as IResponse<string[]>;
    } catch (err) {
      console.log(err);
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
