/* eslint-disable no-underscore-dangle */
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import UserRepository from 'App/repositories/user.repository';
import validator from 'App/modules/validator.module';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import UserDTO from 'App/data-transfer-objects/user.dto';
import { User } from 'Main/database/models/user.model';
import { Bull } from 'Main/jobs';
import ShortcutKeyRepository from 'App/repositories/shortcut-key.repository';
import shortcutKeys from 'Main/data/defaults/shortcut-keys';
import { ShortcutKey } from 'Main/database/models/shortcut-key.model';

export default class UserCreateEvent implements IEvent {
  public channel: string = 'user:create';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | UserDTO | any>
  > {
    try {
      const { user } = eventData;
      const payload: User = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.('create-user');

      if (requesterHasPermission) {
        const _user = UserRepository.create(payload);
        const errors = await validator(_user);

        console.log(errors);
        if (errors && errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        const data: User = await UserRepository.save(_user);

        const keys = ShortcutKeyRepository.create(
          shortcutKeys.map((shortcutKey) => ({
            ...shortcutKey,
            user_id: data.id,
          })) as any[]
        );

        console.log(keys);
        await ShortcutKeyRepository.save(keys);

        await Bull('AUDIT_JOB', {
          user_id: user.id as number,
          resource_id: data.id.toString(),
          resource_table: 'users',
          resource_id_type: 'integer',
          action: 'create',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully created a new User`,
        });

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_table: 'users', // Change this
        action: 'create',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to create a new User`, // Change this
      });

      return {
        errors: ['You are not allowed to create a User'],
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
