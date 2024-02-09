import ImageDTO from 'App/data-transfer-objects/image.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import handleError from 'App/modules/error-handler.module';
import validator from 'App/modules/validator.module';
import ImageRepository from 'App/repositories/image.repository';
import { Image } from 'Main/database/models/image.model';
import { Bull } from 'Main/jobs';

export default class ImageDeleteEvent implements IEvent {
  public channel: string = 'image:update';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | ImageDTO | any>
  > {
    try {
      const { user } = eventData;
      const id = eventData.payload[0];
      const imageUpdate: Image = eventData.payload[1];
      const requesterHasPermission = user.hasPermission?.('update-image');

      if (requesterHasPermission) {
        const image = await ImageRepository.findOneByOrFail({
          id,
        });
        const updatedImage = ImageRepository.merge(image, imageUpdate);
        const errors = await validator(updatedImage);

        if (errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        const data = await ImageRepository.save(updatedImage);

        await Bull('AUDIT_JOB', {
          user_id: user.id as unknown as string,
          resource_id: id.toString(),
          resource_table: 'images',
          resource_id_type: 'uuid',
          action: 'update',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully updated an Image`,
        });

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as unknown as string,
        resource_id: id.toString(),
        resource_table: 'images',
        resource_id_type: 'uuid',
        action: 'update',
        status: 'FAILED',
        description: `User ${user.fullName} has failed to update an Image`,
      });

      return {
        errors: ['You are not allowed to update a Image'],
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
