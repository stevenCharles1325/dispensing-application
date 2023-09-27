import AuthConfig from 'Main/config/auth.config';
import IService from './service.interface';
import UserRepository from 'App/repositories/user.repository';
import bcrypt from 'bcrypt';
import IStorage from '../storage/storage.interface';
import IAuth from '../auth/auth.interface';
import { User } from 'Main/database/models/user.model';
import IResponse from '../pos/pos.response.interface';
import { PermissionsKebabType } from 'Main/data/defaults/permissions';

export default interface IAuthService extends IService {
  readonly AUTH_USER: string;
  readonly AUTH_USER_TOKEN: string;

  readonly config: typeof AuthConfig;
  readonly userRepo: typeof UserRepository;
  readonly encryptor: typeof bcrypt;
  readonly stores: Array<IStorage | any>;

  authentication(
    this: any,
    email: string,
    password: string
  ): Promise<IResponse>;
  revoke(this: any): Promise<IResponse>;
  verifyToken(this: any, token?: string): IResponse;
  generateToken(this: any): [string, string];

  setAuthUser(this: any, payload: IAuth<User>): void;
  getAuthUser(this: any): Partial<User>;

  getStore(this: any, key: string): void;
  setStore(this: any, key: string, value: any): void;

  hasPermission(
    this: any,
    user: Partial<User>,
    ...permission: PermissionsKebabType[]
  ): boolean;
}
