import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import BrandRepository from 'App/repositories/brand.repository';
import validator from 'App/modules/validator.module';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import BrandDTO from 'App/data-transfer-objects/brand.dto';
import { Bull } from 'Main/jobs';
import { Brand } from 'Main/database/models/brand.model';

export default class BrandCreateEvent implements IEvent {
  public channel: string = 'brand:create';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | BrandDTO | any>
  > {
    try {
      // Copy these
      const { user } = eventData;
      const payload: Brand = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.('create-brand');

      if (requesterHasPermission) {
        const brand = BrandRepository.create(payload);
        const errors = await validator(brand);

        console.log(errors);
        if (errors && errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        const data: BrandDTO = await BrandRepository.save(brand);

        // Copy this
        await Bull('AUDIT_JOB', {
          user_id: user.id as number,
          resource_id: data.id.toString(),
          resource_table: 'brands', // Change this
          resource_id_type: 'integer',
          action: 'create',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully created a new Brand`, // Change this
        });

        console.log('CREATED A CATEGORY');
        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      // Copy this
      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_table: 'brands', // Change this
        action: 'create',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to create a new Brand`, // Change this
      });

      return {
        errors: ['You are not allowed to create a Brand'],
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
