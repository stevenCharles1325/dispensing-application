import Provider from '@IOC:Provider';
import ImageDTO from 'App/data-transfer-objects/image.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IObjectStorageService from 'App/interfaces/service/service.object-storage.interface';
import handleError from 'App/modules/error-handler.module';
import { Image } from 'Main/database/models/image.model';
import { SqliteDataSource } from 'Main/datasource';
import { Bull } from 'Main/jobs';

export default class ImageDeleteEvent implements IEvent {
  public channel: string = 'image:delete';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | any>
  > {
    try {
      const { user } = eventData;
      const id: ImageDTO['id'] | Image['id'] = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.('delete-image');

      if (requesterHasPermission) {
        const imageRepo = SqliteDataSource.getRepository(Image);
        const image = await imageRepo.findOneByOrFail({ id });

        const objectStorageService = Provider.ioc<IObjectStorageService>(
          'ObjectStorageProvider'
        );

        await objectStorageService.removeObject({
          bucketName: image.bucket_name,
          objectName: image.name,
        });

        const data = await imageRepo.delete(id);

        await Bull('AUDIT_JOB', {
          user_id: user.id as number,
          resource_id: id.toString(),
          resource_table: 'images',
          resource_id_type: 'integer',
          action: 'delete',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully deleted an Image`,
        });

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_table: 'images',
        action: 'delete',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to delete an Image`,
      });

      return {
        errors: ['You are not allowed to delete an Image'],
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
