/* eslint-disable consistent-return */
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import ImageRepository from 'App/repositories/image.repository';
import validator from 'App/modules/validator.module';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import ImageDTO from 'App/data-transfer-objects/image.dto';
import IObjectStorageService from 'App/interfaces/service/service.object-storage.interface';
import Provider from '@IOC:Provider';
import { Bull } from 'Main/jobs';

export default class ImageCreateEvent implements IEvent {
  public channel: string = 'image:create';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | ImageDTO | any>
  > {
    try {
      const { user } = eventData;
      const requesterHasPermission = user.hasPermission?.('create-image');

      if (requesterHasPermission) {
        const bucketName = eventData.payload[0] as string;
        const imageObj = eventData.payload[1] as Omit<
          ImageDTO,
          'id' | 'created_at' | 'deleted_at' | 'uploader'
        >;

        const objectStorageService = Provider.ioc<IObjectStorageService>(
          'ObjectStorageProvider'
        );

        const metaData = {
          'Content-Type': imageObj.type,
          uploader_id: eventData.user.id,
        };

        objectStorageService.fPutObject({
          bucketName,
          objectName: imageObj.name,
          filePath: imageObj.url,
          metaData,
          callback: (err, objInfo) => {
            if (err) return console.log(err);

            console.log(objInfo);
          },
        });

        const imagePath = objectStorageService.getFilePath({
          bucketName,
          fileName: imageObj.name,
        });

        const image = ImageRepository.create({
          ...imageObj,
          uploader_id: eventData.user.id as unknown as string,
          bucket_name: bucketName,
          url: imagePath,
        });
        const errors = await validator(image);

        console.log(errors);
        if (errors && errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        const data: ImageDTO = await ImageRepository.save(image);

        await Bull('AUDIT_JOB', {
          user_id: user.id as unknown as string,
          resource_id: data.id.toString(),
          resource_table: 'images',
          resource_id_type: 'uuid',
          action: 'create',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully created a new Image`,
        });

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as unknown as string,
        resource_table: 'images',
        action: 'create',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to create a new Image`,
      });

      return {
        errors: ['You are not allowed to create an Image'],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as unknown as IResponse<string[]>;
    } catch (err) {
      console.log('ERROR HANDLER OUTPUT: ', err);
      const error = handleError(err);

      return {
        errors: [error],
        code: 'SYS_ERR',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
