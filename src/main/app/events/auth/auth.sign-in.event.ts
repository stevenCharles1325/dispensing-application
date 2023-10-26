import Provider from '@IOC:Provider';
import UserDTO from 'App/data-transfer-objects/user.dto';
import IAuth from 'App/interfaces/auth/auth.interface';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import handleError from 'App/modules/error-handler.module';
import { User } from 'Main/database/models/user.model';
import { Bull } from 'Main/jobs';

export default class AuthSignIn implements IEvent {
  public channel: string = 'auth:sign-in';

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<IAuth<User> | IPOSError[] | any> {
    try {
      const { email, password } = eventData.payload[0];
      const authService = Provider.ioc<IAuthService>('AuthProvider');

      const res = await authService.authenticate(email, password);

      if (res.status === 'SUCCESS') {
        const { user } = res.data as IAuth<UserDTO>;

        await Bull('AUDIT_JOB', {
          user_id: user.id as number,
          resource_id: user.id.toString() as string,
          resource_table: 'users',
          resource_id_type: 'integer',
          resource_field: 'id',
          old_value: user.id.toString(),
          old_value_type: 'number',
          new_value: user.id.toString(),
          new_value_type: 'number',
          action: 'sign-in',
          status: 'SUCCEEDED',
          description: `User ${user.first_name} ${user.last_name} has successfully signed-in`,
        });
      }

      return res;
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
