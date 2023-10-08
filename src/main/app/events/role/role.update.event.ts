import RoleDTO from 'App/data-transfer-objects/role.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import handleError from 'App/modules/error-handler.module';
import validator from 'App/modules/validator.module';
import RoleRepository from 'App/repositories/role.repository';
import { Role } from 'Main/database/models/role.model';

export default class UserDeleteEvent implements IEvent {
  public channel: string = 'role:update';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | RoleDTO | any>
  > {
    try {
      const id = eventData.payload[0];
      const roleUpdate = eventData.payload[1];

      const requesterHasPermission =
        eventData.user.hasPermission?.('update-role');

      if (requesterHasPermission) {
        const role = await RoleRepository.findOneByOrFail({
          id,
        });
        const updatedRole = RoleRepository.merge(role, roleUpdate);
        const errors = await validator(updatedRole);

        if (errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        const data = (await RoleRepository.save(
          updatedRole
        )) as unknown as RoleDTO;
        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      return {
        errors: ['You are not allowed to update a Role'],
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
