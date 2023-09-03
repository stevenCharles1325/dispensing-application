import Provider from '@IOC:Provider';
import AuthContract from 'Main/contracts/auth-contract';
import { MiddlewareContract } from 'Main/contracts/middleware-contract';
import { User } from 'Main/database/models/User';
import AuthService from '../services/AuthService';

const authMiddleware: MiddlewareContract = ({ eventArgs, storage, next }) => {
  const authService = Provider.ioc<AuthService>('AuthProvider');
  const authUser = storage.get('POS_AUTH_USER_TOKEN') as AuthContract<User>;

  /*
    Usually, we pass the token to the eventArgs index 1
    if the request is sent by peers, while the storage
    is where the data user of this system is stored.
  */
  const token = eventArgs[1] ?? authUser.token;

  const authResponse = authService.verifyToken(token);

  if (authResponse.status === 'SUCCESS') {
    const hasPermission = authService.hasPermission.bind(
      this,
      authResponse.data
    );

    eventArgs.push(hasPermission);
    return next();
  }

  return {
    errors: authResponse.errors,
    status: 'ERROR',
  };
};

export default authMiddleware;
