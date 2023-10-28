import Provider from '@IOC:Provider';
import IAuth from 'App/interfaces/auth/auth.interface';
import IEvent from 'App/interfaces/event/event.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import handleError from 'App/modules/error-handler.module';
import { User } from 'Main/database/models/user.model';
import { Bull } from 'Main/jobs';

export default class AuthSignOutEvent implements IEvent {
  public channel: string = 'auth:sign-out';

  public middlewares = ['auth.middleware'];

  public async listener(): Promise<null | IPOSError[] | any> {
    try {
      const authService = Provider.ioc<IAuthService>('AuthProvider');
      const user = authService.getAuthUser();
      const res = await authService.revoke();

      if (res.status === 'SUCCESS') {
        await Bull('AUDIT_JOB', {
          user_id: user.id as number,
          resource_id: user.id.toString() as string,
          resource_table: 'users',
          resource_id_type: 'integer',
          action: 'sign-out',
          status: 'SUCCEEDED',
          description: `User ${user.first_name} ${user.last_name} has successfully signed-out`,
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
