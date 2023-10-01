import jwt from 'jsonwebtoken';
import UserDTO from 'App/data-transfer-objects/user.dto';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import IPOSError from 'App/interfaces/pos/pos.error.interface';

export default function verifyToken(
  this: any,
  token: string = ''
): IResponse<Partial<UserDTO> | string[] | IPOSError[]> {
  try {
    if (!token.length) {
      return {
        errors: ['User is not authenticated'],
        code: 'AUTH_ERR',
        status: 'ERROR',
      } as unknown as IResponse<string[]>;
    }

    const data = jwt.verify(token, this.config.key) as Partial<UserDTO>;

    return {
      data: data as Partial<UserDTO>,
      code: 'AUTH_OK',
      status: 'SUCCESS',
    } as IResponse<Partial<UserDTO>>;
  } catch (err) {
    console.log(err);
    const error = handleError(err);

    return {
      errors: [error],
      code: 'SYS_ERR',
      status: 'ERROR',
    } as unknown as IResponse<IPOSError[]>;
  }
}
