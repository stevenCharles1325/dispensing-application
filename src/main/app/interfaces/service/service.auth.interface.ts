import AuthConfig from 'Main/config/auth.config';
import IService from './service.interface';
import UserRepository from 'App/repositories/user.repository';
import bcrypt from 'bcrypt';
import IStorage from '../storage/storage.interface';
import IAuth from '../auth/auth.interface';
import IResponse from '../pos/pos.response.interface';
import { PermissionsKebabType } from 'Main/data/defaults/permissions';
import IPOSError from '../pos/pos.error.interface';
import UserDTO from 'App/data-transfer-objects/user.dto';

export default interface IAuthService extends IService {
  readonly AUTH_USER: string;
  readonly AUTH_USER_TOKEN: string;

  readonly config: typeof AuthConfig;
  readonly userRepo: typeof UserRepository;
  readonly encryptor: typeof bcrypt;
  readonly stores: Array<IStorage | any>;

  authenticate(
    this: any,
    email: string,
    password: string
  ): Promise<IResponse<IAuth<UserDTO> | IPOSError[]>>;
  revoke(this: any): Promise<IResponse<IPOSError[] | string[] | null>>;
  verifyToken(
    this: any,
    token?: string | null
  ): IResponse<Partial<UserDTO> | string[] | IPOSError[]>;
  generateToken(this: any): [string, string];

  setAuthUser(this: any, payload: IAuth<UserDTO>): void;
  getAuthUser(this: any): IAuth<UserDTO>['user'];

  getAuthToken(this: any): IAuth<UserDTO>;

  getStore(this: any, key: string): void;
  setStore(this: any, key: string, value: any): void;

  hasPermission(
    this: any,
    user: Partial<UserDTO>,
    ...permission: PermissionsKebabType[]
  ): boolean;
}
