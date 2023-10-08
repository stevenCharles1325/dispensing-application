import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import ImageRepository from 'App/repositories/image.repository';
import validator from 'App/modules/validator.module';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import ImageDTO from 'App/data-transfer-objects/image.dto';

export default class ImageCreateEvent implements IEvent {
  public channel: string = 'image:create';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | ImageDTO | any>
  > {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('create-image');

      if (requesterHasPermission) {
        const image = ImageRepository.create(eventData.payload[0]);
        const errors = await validator(image);

        console.log(errors);
        if (errors && errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        const data = (await ImageRepository.save(image)) as unknown as ImageDTO;
        console.log('CREATED A CATEGORY');
        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      return {
        errors: ['You are not allowed to create an Image'],
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
