import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import { Image } from 'Main/database/models/image.model';
import { SqliteDataSource } from 'Main/datasource';

export default class ImageArchiveEvent implements IEvent {
  public channel: string = 'image:archive';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | any>
  > {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('archive-image');

      if (requesterHasPermission) {
        const imageRepo = SqliteDataSource.getRepository(Image);
        const data = await imageRepo.softDelete(eventData.payload[0]);

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      return {
        errors: ['You are not allowed to archive an Image'],
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
