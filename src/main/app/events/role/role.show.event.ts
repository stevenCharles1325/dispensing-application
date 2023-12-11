/* eslint-disable no-continue */
/* eslint-disable react-hooks/rules-of-hooks */
import Provider from '@IOC:Provider';
import RoleDTO from 'App/data-transfer-objects/role.dto';
import UserDTO from 'App/data-transfer-objects/user.dto';
import usePagination from 'App/hooks/pagination.hook';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import handleError from 'App/modules/error-handler.module';
import RoleRepository from 'App/repositories/role.repository';

export default class RoleShowEvent implements IEvent {
  public channel: string = 'role:show';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPagination<RoleDTO> | IPOSError[] | any>
  > {
    try {
      const authService = Provider.ioc<IAuthService>('AuthProvider');
      const requesterHasPermission =
        eventData.user.hasPermission?.('view-role');

      const authRes = authService.verifyToken(eventData.user.token);
      const user = authRes.data as UserDTO;

      if (requesterHasPermission) {
        const payload = eventData.payload[0] ?? 'all';
        const page = eventData.payload[1] || 1; // Page
        const take = eventData.payload[2] || 15; // Total
        const skip = (page - 1) * take;

        const roleQuery = RoleRepository.createQueryBuilder(
          'role'
        ).leftJoinAndSelect('role.permissions', 'permissions');

        if (take !== 'max') {
          roleQuery.take(take).skip(skip);
        }

        if (user.role.name !== 'Owner') {
          roleQuery.where(`role.name != 'Owner'`);
        }

        if (payload === 'all') {
          return await usePagination(roleQuery, page);
        }

        if (payload instanceof Object && !(payload instanceof Array)) {
          // eslint-disable-next-line no-restricted-syntax
          for (const [propertyName, propertyFind] of Object.entries(payload)) {
            if (!(propertyFind as any)?.length) continue;

            if (propertyFind instanceof Array) {
              roleQuery
                .where(`role.${propertyName} IN (:...${propertyName})`)
                .setParameter(propertyName, propertyFind);
            } else {
              roleQuery
                .where(`role.${propertyName} LIKE :${propertyName}`)
                .setParameter(propertyName, `%${propertyFind}%`);
            }
          }

          return await usePagination<RoleDTO>(roleQuery, page);
        }

        return {
          errors: ['The query argument must be an Object'],
          code: 'REQ_INVALID',
          status: 'ERROR',
        } as unknown as IResponse<string[]>;
      }

      return {
        errors: ['You are not allowed to view a Role'],
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
