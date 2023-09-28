/* eslint-disable camelcase */
/* eslint-disable no-prototype-builtins */
import bcrypt from 'bcrypt';
import IStorage from 'App/interfaces/storage/storage.interface';
import UserRepository from 'App/repositories/user.repository';
import AuthConfig from 'Main/config/auth.config';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import authenticate from 'App/modules/service/auth/auth.authenticate.module';
import generateToken from 'App/modules/service/auth/auth.generate-token.module';
import revoke from 'App/modules/service/auth/auth.revoke.module';
import verifyToken from 'App/modules/service/auth/auth.verify-token.module';
import getAuthUser from 'App/modules/service/auth/auth.get-auth-user.module';
import setAuthUser from 'App/modules/service/auth/auth.set-auth-user.module';
import hasPermission from 'App/modules/service/auth/auth.has-permission.module';
import {
  clearStore,
  getStore,
  setStore,
} from 'App/modules/service/auth/auth.store.module';

export default class AuthService implements Partial<IAuthService> {
  public readonly SERVICE_NAME: 'AUTH_SERVICE';

  public readonly AUTH_USER = 'POS_AUTH_USER';

  public readonly AUTH_USER_TOKEN = 'POS_AUTH_USER_TOKEN';

  constructor(
    public readonly config: typeof AuthConfig,
    public readonly userRepo: typeof UserRepository,
    public readonly encryptor: typeof bcrypt,
    public readonly stores: Array<IStorage | any> = []
  ) {}
}

Object.assign(AuthService.prototype, {
  revoke,
  getStore,
  setStore,
  clearStore,
  getAuthUser,
  setAuthUser,
  verifyToken,
  authenticate,
  hasPermission,
  generateToken,
});
