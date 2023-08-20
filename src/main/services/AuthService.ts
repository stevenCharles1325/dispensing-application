/* eslint-disable camelcase */
/* eslint-disable no-prototype-builtins */
import UserRepository from 'Repositories/User-repository';
import bcrypt from 'bcrypt';
import POSError from 'Main/contracts/pos-error-contract';
import jwt from 'jsonwebtoken';
import AuthContract from 'Main/contracts/auth-contract';
import { User } from 'Main/database/models/User';
import AuthConfig from 'Main/config/auth';
import Store from 'electron-store';

export default class AuthService {
  constructor(
    public readonly config: typeof AuthConfig,
    public readonly userRepo: typeof UserRepository,
    public readonly encryptor: typeof bcrypt,
    private store: Store = new Store()
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
    this.store.set('POS_AUTH_USER', payload);
  }

  private get authUser(): AuthContract<User> {
    return this.store.get('POS_AUTH_USER') as AuthContract<User>;
  }

  public async authenticate(
    email: string,
    password: string
  ): Promise<POSError | AuthContract<User> | null> {
    const user = await this.userRepo.findOneBy({ email });
    let result: POSError | AuthContract<User> | null = null;

    if (user) {
      try {
        const isPasswordCorrect = this.encryptor.compareSync(
          password,
          user.password
        );

        if (!isPasswordCorrect) {
          result = {
            code: 'POS_INVALID_PASSWORD',
            message: 'Password is incorrect',
            type: 'POS_ERROR',
          };
        } else {
          // Generate token
          const user_data = {
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone_number: user.phone_number,
          };

          const [token, refresh_token] = this.generateToken(user_data);

          const payload: AuthContract<User> = {
            token,
            refresh_token,
            user,
            expires_at: this.parseTimeExpression(this.config.token_expires_at),
            refresh_token_expires_at: this.parseTimeExpression(
              this.config.refresh_token_expires_at
            ),
          };

          this.authUser = payload;
          return payload;
        }
      } catch (err) {
        if (err) {
          result = {
            code: null,
            message: (err as any)?.message ?? 'Please try again later',
            type: 'POS_ERROR',
          };
        }
      }

      return result;
    }

    return {
      code: 'POS_USER_NOT_FOUND',
      message: 'User does not exist',
      type: 'POS_ERROR',
    };
  }
}
