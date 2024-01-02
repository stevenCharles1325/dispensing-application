import SystemDTO from "App/data-transfer-objects/system.dto";
import usePagination from "App/hooks/pagination.hook";
import IEvent from "App/interfaces/event/event.interface";
import IEventListenerProperties from "App/interfaces/event/event.listener-props.interface";
import IPagination from "App/interfaces/pagination/pagination.interface";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IResponse from "App/interfaces/pos/pos.response.interface";
import handleError from "App/modules/error-handler.module";
import SystemRepository from "App/repositories/system.repository";

export default class SystemShowEvent implements IEvent {
  public channel: string = 'system:show';

  public middlewares = ['auth.v2.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IPagination<SystemDTO> | any>
  > {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('view-system') ??
        eventData.user.hasSystemKey;

      if (requesterHasPermission) {
        const payload = eventData.payload[0] ?? 'all';
        const page = eventData.payload[1] || 1; // Page
        const take = eventData.payload[2] || 15; // Total
        const skip = (page - 1) * take;

        const systemQuery = SystemRepository.createQueryBuilder();

        if (take !== 'max') {
          systemQuery.take(take).skip(skip);
        }

        if (payload === 'all') {
          return await usePagination(systemQuery, page);
        }

        if (payload instanceof Object && !(payload instanceof Array)) {
          // eslint-disable-next-line no-restricted-syntax
          for (const [propertyName, propertyFind] of Object.entries(payload)) {
            if (!(propertyFind as any)?.length) continue;

            if (propertyFind instanceof Array) {
              systemQuery
                .where(`${propertyName} IN (:...${propertyName})`)
                .setParameter(propertyName, propertyFind);
            } else {
              systemQuery
                .where(`${propertyName} LIKE :${propertyName}`)
                .setParameter(propertyName, `%${propertyFind}%`);
            }
          }

          return await usePagination(systemQuery, page);
        }

        return {
          errors: ['The query argument must be an Object'],
          code: 'REQ_INVALID',
          status: 'ERROR',
        } as unknown as IResponse<string[]>;
      }

      return {
        errors: ['You are not allowed to view system data'],
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
