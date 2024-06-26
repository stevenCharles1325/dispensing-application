/* eslint-disable no-continue */
/* eslint-disable react-hooks/rules-of-hooks */
import ImageDTO from 'App/data-transfer-objects/image.dto';
import usePagination from 'App/hooks/pagination.hook';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import ImageRepository from 'App/repositories/image.repository';

export default class ImageShowEvent implements IEvent {
  public channel: string = 'image:show';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IPagination<ImageDTO> | any>
  > {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('view-image');

      if (requesterHasPermission) {
        const payload = eventData.payload[0] ?? 'all';
        const page = eventData.payload[1] || 1; // Page
        const take = eventData.payload[2] || 15; // Total
        const skip = (page - 1) * take;

        const imageQuery = ImageRepository.createQueryBuilder(
          'image'
        ).leftJoinAndSelect('image.uploader', 'uploader');

        if (payload['bucket_name'] === 'users') {
          imageQuery
            .where('image.uploader_id = :user_id')
            .setParameter('user_id', eventData.user.id);
        }

        if (take !== 'max') {
          imageQuery.take(take).skip(skip);
        }

        if (payload === 'all') {
          return await usePagination(imageQuery, page, take);
        }

        if (payload instanceof Object && !(payload instanceof Array)) {
          // eslint-disable-next-line no-restricted-syntax
          for (const [propertyName, propertyFind] of Object.entries(payload)) {
            if (!(propertyFind as any)?.length) continue;

            if (propertyFind instanceof Array) {
              imageQuery
                .where(`image.${propertyName} IN (:...${propertyName})`)
                .setParameter(propertyName, propertyFind);
            } else {
              imageQuery
                .where(`image.${propertyName} LIKE :${propertyName}`)
                .setParameter(propertyName, `%${propertyFind}%`);
            }
          }

          return await usePagination(imageQuery, page, take);
        }

        return {
          errors: ['The query argument must be an Object'],
          code: 'REQ_INVALID',
          status: 'ERROR',
        } as unknown as IResponse<string[]>;
      }

      return {
        errors: ['You are not allowed to view an Image'],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as unknown as IResponse<string[]>;
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
