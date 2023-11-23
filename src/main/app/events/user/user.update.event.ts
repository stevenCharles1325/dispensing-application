/* eslint-disable no-underscore-dangle */
import UserDTO from 'App/data-transfer-objects/user.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import handleError from 'App/modules/error-handler.module';
import validator from 'App/modules/validator.module';
import RoleRepository from 'App/repositories/role.repository';
import UserRepository from 'App/repositories/user.repository';
import { User } from 'Main/database/models/user.model';
import { Bull } from 'Main/jobs';

export default class UserDeleteEvent implements IEvent {
  public channel: string = 'user:update';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | UserDTO | any>
  > {
    try {
      const { user } = eventData;
      const id = eventData.payload[0];
      const userUpdate: User = eventData.payload[1];

      const requesterHasPermission =
        eventData.user.hasPermission?.('update-user');

      if (requesterHasPermission) {
        const _user = await UserRepository.findOneByOrFail({
          id,
        });
        const role = await RoleRepository.findOneByOrFail({
          id: userUpdate.role_id,
        });
        const updatedUser = UserRepository.merge(_user, userUpdate);
        const errors = await validator(updatedUser);

        if (errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        updatedUser.role = role;
        const data: User = await UserRepository.save(updatedUser);

        await Bull('AUDIT_JOB', {
          user_id: user.id as number,
          resource_id: id.toString(),
          resource_table: 'users',
          resource_id_type: 'integer',
          action: 'update',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully updated a User`,
        });

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_id: id.toString(),
        resource_table: 'users',
        resource_id_type: 'integer',
        action: 'update',
        status: 'FAILED',
        description: `User ${user.fullName} has failed to update a User`,
      });

      return {
        errors: ['You are not allowed to update a User'],
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
