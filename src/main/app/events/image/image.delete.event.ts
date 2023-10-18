import Provider from '@IOC:Provider';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IObjectStorageService from 'App/interfaces/service/service.object-storage.interface';
import handleError from 'App/modules/error-handler.module';
import { Image } from 'Main/database/models/image.model';
import { SqliteDataSource } from 'Main/datasource';

export default class ImageDeleteEvent implements IEvent {
  public channel: string = 'image:delete';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | any>
  > {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('delete-image');

      if (requesterHasPermission) {
        const id = eventData.payload[0];
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

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

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
