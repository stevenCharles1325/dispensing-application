import Provider from '@IOC:Provider';
import AuthContract from 'Main/app/interfaces/auth-contract';
import { MiddlewareContract } from 'Main/app/interfaces/middleware-contract';
import ResponseContract from 'Main/app/interfaces/response-contract';
import { User } from 'Main/database/models/User';
import AuthService from '../services/auth.service';

const authMiddleware: MiddlewareContract = ({ eventData, storage, next }) => {
  const authService = Provider.ioc<AuthService>('AuthProvider');
  const authUser = storage.get('POS_AUTH_USER_TOKEN') as AuthContract<User>;

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
  } as ResponseContract;
};

export default authMiddleware;
