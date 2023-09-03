/* eslint-disable camelcase */
/* eslint-disable no-prototype-builtins */
import UserRepository from 'Main/app/repositories/User-repository';
import bcrypt from 'bcrypt';
import POSError from 'Main/contracts/pos-error-contract';
import jwt from 'jsonwebtoken';
import AuthContract from 'Main/contracts/auth-contract';
import { User } from 'Main/database/models/User';
import AuthConfig from 'Main/config/auth';
import Store from 'electron-store';
import ResponseContract from 'Main/contracts/response-contract';
import TokenRepository from '../repositories/Token-repository';
import StorageContract from 'Main/contracts/storage-contract';
import { ALSStorage } from 'Main/stores';
import { SqliteDataSource } from 'Main/datasource';
import { Token } from 'Main/database/models/Token';
import handleError from '../modules/error-handler';
import UserContract from 'Main/contracts/user-contract';
import { PermissionsKebabType } from 'Main/data/defaults/permissions';

export default class AuthService {
  private readonly AUTH_USER = 'POS_AUTH_USER';

  private readonly AUTH_USER_TOKEN = 'POS_AUTH_USER_TOKEN';

  constructor(
    public readonly config: typeof AuthConfig,
    public readonly userRepo: typeof UserRepository,
    public readonly encryptor: typeof bcrypt,
    private store: Store = new Store(),
    private store2: StorageContract = ALSStorage()
  ) {}

  private parseTimeExpression(expression: string): Date {
    const timePattern = /^(\d+)([a-z]+)$/i;
    const match = expression.match(timePattern);

    if (!match) {
      throw new Error('Invalid time expression format');
    }

    const unitInMilliseconds = {
      ms: 1,
      s: 1000,
      m: 60000,
      h: 3600000,
      d: 86400000,
    } as const;

    type UnitType = keyof typeof unitInMilliseconds;
    // eslint-disable-next-line radix
    const value = parseInt(match[1]);
    const unit: UnitType = match[2].toLowerCase() as UnitType;

    if (!unitInMilliseconds.hasOwnProperty(unit)) {
      throw new Error('Invalid time unit');
    }

    const expirationTime = new Date();
    expirationTime.setTime(
      expirationTime.getTime() + value * unitInMilliseconds[unit]
    );

    return expirationTime;
  }

  private generateToken(payload: Partial<User>): [string, string] {
    const token = jwt.sign(payload, this.config.key, {
      expiresIn: this.config.token_expires_at,
    });

    const refresh_token = jwt.sign(payload, this.config.key, {
      expiresIn: this.config.refresh_token_expires_at,
    });

    return [token, refresh_token];
  }

  private set authUser(payload: AuthContract<User>) {
    this.store.set(this.AUTH_USER_TOKEN, payload);
    this.store2.set(this.AUTH_USER_TOKEN, payload);

    this.store.set(this.AUTH_USER, payload.user);
    this.store2.set(this.AUTH_USER, payload.user);
  }

  public getAuthUser(): Partial<User> {
    const authUser =
      (this.store.get(this.AUTH_USER) as Partial<User>) ??
      (this.store2.get(this.AUTH_USER) as Partial<User>);

    if (!authUser) {
      throw new Error('AuthUser is not available');
    }

    return authUser;
  }

  // Sign in
  public async authenticate(
    email: string,
    password: string
  ): Promise<ResponseContract> {
    const user = await this.userRepo.findOneBy({ email });
    let result: POSError | AuthContract<User> | null = null;
    let status: 'SUCCESS' | 'ERROR' = 'ERROR';

    if (user) {
      try {
        const isPasswordCorrect = this.encryptor.compareSync(
          password,
          user.password
        );

        if (!isPasswordCorrect) {
          result = {
            code: 'POS_INVALID_CREDENTIALS',
            message: 'Email or Password is incorrect',
            type: 'POS_ERROR',
          };
        } else {
          // Generate token
          const user_data = {
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            full_name: user.fullName(),
            phone_number: user.phone_number,
            role: user.role,
          };

          const [token, refresh_token] = this.generateToken(user_data);
          const payload: AuthContract<User> = {
            token,
            refresh_token,
            user,
            token_expires_at: this.parseTimeExpression(
              this.config.token_expires_at
            ),
            refresh_token_expires_at: this.parseTimeExpression(
              this.config.refresh_token_expires_at
            ),
          };

          await TokenRepository.save({
            user_id: user.id,
            token,
            refresh_token,
            token_expires_at: payload.token_expires_at,
            refresh_token_expires_at: payload.refresh_token_expires_at,
          });

          this.authUser = payload;
          status = 'SUCCESS';
        }
      } catch (err) {
        if (err) {
          result = {
            code: null,
            message: (err as any)?.message ?? 'Please try again later',
            type: 'POS_ERROR',
          };
        }

        status = 'ERROR';
      }
    } else {
      result = {
        code: 'POS_INVALID_CREDENTIALS',
        message: 'Email or Password is incorrect',
        type: 'POS_ERROR',
      };

      status = 'ERROR';
    }

    if (status === 'SUCCESS') {
      return {
        data:
          this.store.get(this.AUTH_USER_TOKEN) ??
          this.store2.get(this.AUTH_USER_TOKEN),
        status,
      };
    }

    return {
      errors: [result],
      status,
    };
  }

  // Log out
  public async revoke() {
    const data =
      this.store.get(this.AUTH_USER) ?? this.store2.get(this.AUTH_USER);

    if (data) {
      try {
        const token = await SqliteDataSource.getRepository(Token);
        await token.delete({ user_id: data.user.id });

        this.store.clear();
        this.store2.clear();

        return {
          status: 'SUCCESS',
        };
      } catch (err) {
        const errors = handleError(err);
        console.log(errors);

        return {
          errors,
          status: 'ERROR',
        };
      }
    }

    return {
      errors: ['User is not authenticated'],
      status: 'ERROR',
    };
  }

  public verifyToken(token: string = ''): ResponseContract {
    try {
      const data = jwt.verify(token, this.config.key) as Partial<UserContract>;

      return {
        data: data as Partial<UserContract>,
        status: 'SUCCESS',
      };
    } catch (err) {
      const error = handleError(err);
      return {
        errors: [error],
        status: 'ERROR',
      };
    }
  }

  public hasPermission(
    user: Partial<UserContract>,
    ...permission: PermissionsKebabType[]
  ) {
    console.log(user);
    return user.role!.permissions!.some(({ kebab }) =>
      permission.includes(kebab as PermissionsKebabType)
    );
  }
}
