import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import RoleRepository from 'App/repositories/role.repository';
import validator from 'App/modules/validator.module';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import { Role } from 'Main/database/models/role.model';
import RoleDTO from 'App/data-transfer-objects/role.dto';
import { Bull } from 'Main/jobs';

export default class RoleCreateEvent implements IEvent {
  public channel: string = 'role:create';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IPOSValidationError[] | RoleDTO | any>
  > {
    try {
      const { user } = eventData;
      const payload: RoleDTO | Role = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.('create-role');

      if (requesterHasPermission) {
        const role = RoleRepository.create(payload);
        const errors = await validator(role);

        console.log(errors);
        if (errors && errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        const data = (await RoleRepository.save(role)) as unknown as RoleDTO;

        await Bull('AUDIT_JOB', {
          user_id: user.id as number,
          resource_id: data.id.toString(),
          resource_table: 'roles',
          resource_id_type: 'integer',
          action: 'create',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully created a new Role`,
        });

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_table: 'roles',
        action: 'create',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to create a new Role`,
      });

      return {
        errors: ['You are not allowed to create a Role'],
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
