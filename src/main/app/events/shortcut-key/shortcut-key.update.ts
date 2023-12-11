import ShortcutKeyDTO from 'App/data-transfer-objects/shortcut-key.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import handleError from 'App/modules/error-handler.module';
import validator from 'App/modules/validator.module';
import ShortcutKeyRepository from 'App/repositories/shortcut-key.repository';
import { ShortcutKey } from 'Main/database/models/shortcut-key.model';
import { Bull } from 'Main/jobs';

export default class ShortcutKeyUpdateEvent implements IEvent {
  public channel: string = 'shortcut-key:update';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | ShortcutKeyDTO | any>
  > {
    try {
      const { user } = eventData;
      const id = eventData.payload[0];
      const shortcutKeyUpdate: Pick<
        ShortcutKey,
        'key' | 'key_combination'
      > = eventData.payload[1];

      if (user.id) {
        const shortcutKey = await ShortcutKeyRepository.findOneByOrFail({
          id,
          user_id: user.id,
        });
        const updatedKey = ShortcutKeyRepository.merge(shortcutKey, shortcutKeyUpdate);
        const errors = await validator(updatedKey);

        if (errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        await Bull('AUDIT_JOB', {
          user_id: user.id as number,
          resource_id: id.toString(),
          resource_table: 'shortcut_keys',
          resource_id_type: 'integer',
          action: 'update',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully updated a Shortcut-key`,
        });

        const data: ShortcutKey = await ShortcutKeyRepository.save(updatedKey);

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_id: id.toString(),
        resource_table: 'shortcut_keys',
        resource_id_type: 'integer',
        action: 'update',
        status: 'FAILED',
        description: `User ${user.fullName} has failed to update a Shortcut-key`,
      });

      return {
        errors: ['You are not authenticated'],
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
