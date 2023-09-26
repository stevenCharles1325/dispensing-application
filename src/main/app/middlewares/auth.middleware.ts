import Provider from '@IOC:Provider';
import AuthService from 'Services/auth.service';
import { User } from 'Models/user.model';
import IAuth from 'Interfaces/auth/auth.interface';
import IMiddleware from 'Interfaces/middleware/middleware.interface';
import IResponse from 'Interfaces/pos/pos.response.interface';

const authMiddleware: IMiddleware = ({ eventData, storage, next }) => {
  const authService = Provider.ioc<AuthService>('AuthProvider');
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
