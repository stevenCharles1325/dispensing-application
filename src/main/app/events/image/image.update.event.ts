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

export default class ImageDeleteEvent implements IEvent {
  public channel: string = 'image:update';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | ImageDTO | any>
  > {
    try {
      const id = eventData.payload[0];
      const imageUpdate = eventData.payload[1];

      const requesterHasPermission =
        eventData.user.hasPermission?.('update-image');

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
        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

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
