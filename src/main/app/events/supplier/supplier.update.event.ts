import SupplierDTO from 'App/data-transfer-objects/supplier.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import handleError from 'App/modules/error-handler.module';
import validator from 'App/modules/validator.module';
import SupplierRepository from 'App/repositories/supplier.repository';
import { Supplier } from 'Main/database/models/supplier.model';

export default class SupplierDeleteEvent implements IEvent {
  public channel: string = 'supplier:update';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | SupplierDTO | any>
  > {
    try {
      const id = eventData.payload[0];
      const supplierUpdate = eventData.payload[1];

      const requesterHasPermission =
        eventData.user.hasPermission?.('update-supplier');

      if (requesterHasPermission) {
        const supplier = await SupplierRepository.findOneByOrFail({
          id,
        });
        const updatedSupplier = SupplierRepository.merge(
          supplier,
          supplierUpdate
        );
        const errors = await validator(updatedSupplier);

        if (errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        const data = (await SupplierRepository.save(
          updatedSupplier
        )) as unknown as SupplierDTO;
        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      return {
        errors: ['You are not allowed to update a Supplier'],
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
