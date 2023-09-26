import Provider from '@IOC:Provider';
import IAuth from 'App/interfaces/auth/auth.interface';
import IMiddleware from 'App/interfaces/middleware/middleware.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import { User } from 'Main/database/models/user.model';

const authMiddleware: IMiddleware = ({ eventData, storage, next }) => {
  const authService = Provider.ioc<IAuthService>('AuthProvider');
  const authUser = storage.get('POS_AUTH_USER_TOKEN') as IAuth<User>;

  /*
    Usually, we pass the token to the eventData, under
    the "user" property if the request is sent by peers,
    while the storage is where the data user of this
    system is stored.
  */
  const token = eventData.user?.token?.length
    ? eventData.user?.token
    : authUser?.token;

  const authResponse = authService.verifyToken(token);

  if (authResponse.status === 'SUCCESS') {
    const hasPermission = authService.hasPermission.bind(
      this,
      authResponse.data // user
    );

    eventData.user.hasPermission = hasPermission;
    return next();
  }

  return {
    errors: authResponse.errors,
    code: 'AUTH_ERR',
    status: 'ERROR',
  } as IResponse;
};

export default authMiddleware;
