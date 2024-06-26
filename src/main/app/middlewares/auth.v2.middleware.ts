import Provider from '@IOC:Provider';
import UserDTO from 'App/data-transfer-objects/user.dto';
import IMiddleware from 'App/interfaces/middleware/middleware.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IAuthService from 'App/interfaces/service/service.auth.interface';

const authV2Middleware: IMiddleware<IPOSError[] | void> = ({
  eventData,
  next,
}) => {
  const authService = Provider.ioc<IAuthService>('AuthProvider');

  /*
    Usually, we pass the token to the eventData, under
    the "user" property if the request is sent by peers,
    while the storage is where the data user of this
    system is stored.
  */

  eventData.user.token ??= authService.getAuthToken?.()?.token;
  const { token } = eventData.user;

  const authResponse = authService.verifyToken(token);
  const hasSystemKey = eventData.payload.some((datum: any) => {
    if (typeof datum === 'string') {
      return datum === process.env.SYSTEM_KEY;
    }

    return false;
  })

  eventData.user.hasSystemKey = hasSystemKey;

  if (authResponse.status === 'SUCCESS') {
    const user = authResponse.data as UserDTO;
    const hasPermission = authService.hasPermission.bind(this, user);

    eventData.user.id = user.id;
    eventData.user.fullName =
      user?.fullName?.() ?? `${user.first_name} ${user.last_name}`;
    eventData.user.hasPermission = hasPermission;
    return next();
  } else if (hasSystemKey) {
    return next();
  }

  return {
    errors: authResponse.errors,
    code: 'AUTH_ERR',
    status: 'ERROR',
  } as IResponse<IPOSError[]>;
};

export default authV2Middleware;
