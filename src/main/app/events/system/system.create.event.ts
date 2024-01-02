import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import SystemRepository from 'App/repositories/system.repository';
import validator from 'App/modules/validator.module';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import SystemDTO from 'App/data-transfer-objects/system.dto';
import { System } from 'Main/database/models/system.model';
import { runSeeders } from 'typeorm-extension';

export default class SystemCreateEvent implements IEvent {
  public channel: string = 'system:create';

  public middlewares = ['auth.v2.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | SystemDTO | any>
  > {
    try {
      const { user } = eventData;
      const payload: System = eventData.payload[0];
      const requesterHasPermission = user.hasSystemKey;

      if (requesterHasPermission) {
        const system = SystemRepository.create(payload);
        const errors = await validator(system);

        if (errors && errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        const data: SystemDTO = await SystemRepository.save(system);

        console.log('INITIALIZED SYSTEM');
        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      return {
        errors: ['You are not allowed to initialized a System'],
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
