import CategoryDTO from 'App/data-transfer-objects/category.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import handleError from 'App/modules/error-handler.module';
import validator from 'App/modules/validator.module';
import CategoryRepository from 'App/repositories/category.repository';
import { Category } from 'Main/database/models/category.model';
import { Bull } from 'Main/jobs';

export default class CategoryDeleteEvent implements IEvent {
  public channel: string = 'category:update';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | CategoryDTO | any>
  > {
    try {
      const { user } = eventData;
      const id = eventData.payload[0];
      const categoryUpdate: Category = eventData.payload[1];
      const requesterHasPermission = user.hasPermission?.('update-category');

      if (requesterHasPermission) {
        const category = await CategoryRepository.findOneByOrFail({
          id,
        });
        const updatedCategory = CategoryRepository.merge(
          category,
          categoryUpdate
        );
        const errors = await validator(updatedCategory);

        if (errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        await Bull('AUDIT_JOB', {
          user_id: user.id as unknown as string,
          resource_id: id.toString(),
          resource_table: 'categories',
          resource_id_type: 'uuid',
          action: 'update',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully updated a Category`,
        });

        const data = await CategoryRepository.save(updatedCategory);
        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as unknown as string,
        resource_id: id.toString(),
        resource_table: 'categories',
        resource_id_type: 'uuid',
        action: 'update',
        status: 'FAILED',
        description: `User ${user.fullName} has failed to update a Category`,
      });

      return {
        errors: ['You are not allowed to update a Category'],
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
