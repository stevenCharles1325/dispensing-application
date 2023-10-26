import BrandDTO from 'App/data-transfer-objects/brand.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import handleError from 'App/modules/error-handler.module';
import validator from 'App/modules/validator.module';
import BrandRepository from 'App/repositories/brand.repository';
import { Brand } from 'Main/database/models/brand.model';
import { Bull } from 'Main/jobs';

export default class BrandDeleteEvent implements IEvent {
  public channel: string = 'brand:update';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | BrandDTO | any>
  > {
    try {
      const { user } = eventData;
      const id = eventData.payload[0];
      const brandUpdate: BrandDTO | Brand = eventData.payload[1];
      const requesterHasPermission = user.hasPermission?.('update-brand');

      if (requesterHasPermission) {
        const brand = await BrandRepository.findOneByOrFail({
          id,
        });
        const updatedBrand = BrandRepository.merge(brand, brandUpdate);
        const errors = await validator(updatedBrand);

        if (errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        await Bull('AUDIT_JOB', {
          user_id: user.id as number,
          resource_id: id.toString(),
          resource_table: 'brands',
          resource_id_type: 'integer',
          action: 'update',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully deleted a Brand`,
        });

        const data = await BrandRepository.save(updatedBrand);
        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_id: id.toString(),
        resource_table: 'brands',
        resource_id_type: 'integer',
        action: 'update',
        status: 'FAILED',
        description: `User ${user.fullName} has failed to delete a Brand`,
      });

      return {
        errors: ['You are not allowed to update a Brand'],
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
