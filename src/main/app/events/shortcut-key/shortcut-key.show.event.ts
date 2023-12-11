/* eslint-disable no-continue */
/* eslint-disable react-hooks/rules-of-hooks */
import ShortcutKeyDTO from 'App/data-transfer-objects/shortcut-key.dto';
import usePagination from 'App/hooks/pagination.hook';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import ShortcutKeyRepository from 'App/repositories/shortcut-key.repository';

export default class ShortcutKeyShowEvent implements IEvent {
  public channel: string = 'shortcut-key:show';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPagination<ShortcutKeyDTO> | IPOSError[] | any>
  > {
    try {
      const payload = eventData.payload[0] ?? 'all';
      const page = eventData.payload[1] || 1; // Page
      const take = eventData.payload[2] || 15; // Total
      const skip = (page - 1) * take;

      const keyQuery = ShortcutKeyRepository.createQueryBuilder(
        'key'
      );

      if (take !== 'max') {
        keyQuery.take(take).skip(skip);
      }

      if (payload === 'all') {
        return await usePagination(keyQuery, page);
      }

      if (payload instanceof Object && !(payload instanceof Array)) {
        // eslint-disable-next-line no-restricted-syntax
        for (const [propertyName, propertyFind] of Object.entries(payload)) {
          if (!(propertyFind as any)?.length) continue;

          if (propertyFind instanceof Array) {
            keyQuery
              .where(`key.${propertyName} IN (:...${propertyName})`)
              .setParameter(propertyName, propertyFind);
          } else {
            keyQuery
              .where(`key.${propertyName} LIKE :${propertyName}`)
              .setParameter(propertyName, `%${propertyFind}%`);
          }
        }

        return await usePagination<ShortcutKeyDTO>(keyQuery, page);
      }

      return {
        errors: ['The query argument must be an Object'],
        code: 'REQ_INVALID',
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
