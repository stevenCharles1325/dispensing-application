import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import CategoryRepository from 'App/repositories/category.repository';
import validator from 'App/modules/validator.module';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import CategoryDTO from 'App/data-transfer-objects/category.dto';
import { Category } from 'Main/database/models/category.model';
import { Bull } from 'Main/jobs';

export default class CategoryCreateEvent implements IEvent {
  public channel: string = 'category:create';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<
      string[] | IPOSError[] | IPOSValidationError[] | CategoryDTO | any
    >
  > {
    try {
      const { user } = eventData;
      const payload: CategoryDTO | Category = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.('create-category');

      if (requesterHasPermission) {
        const category = CategoryRepository.create(payload);
        const errors = await validator(category);

        console.log(errors);
        if (errors && errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        const data: CategoryDTO = await CategoryRepository.save(category);

        await Bull('AUDIT_JOB', {
          user_id: user.id as number,
          resource_id: data.id.toString(),
          resource_table: 'categories',
          resource_id_type: 'integer',
          action: 'create',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully created a new Category`,
        });

        console.log('CREATED A CATEGORY');
        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_table: 'categories',
        action: 'create',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to create a new Category`,
      });

      return {
        errors: ['You are not allowed to create a Category'],
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
