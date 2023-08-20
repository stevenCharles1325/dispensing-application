/* eslint-disable camelcase */
/* eslint-disable no-prototype-builtins */
import UserRepository from 'Repositories/User-repository';
import bcrypt from 'bcrypt';
import POSError from 'Main/contracts/pos-error-contract';
import jwt from 'jsonwebtoken';
import AuthContract from 'Main/contracts/auth-contract';
import { User } from 'Main/database/models/User';
import AuthConfig from 'Main/config/auth';

export default class AuthService {
  constructor(
    public readonly config: typeof AuthConfig,
    public readonly userRepo: typeof UserRepository,
    public readonly encryptor: typeof bcrypt
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

  public async authenticate(
    email: string,
    password: string
  ): Promise<POSError | AuthContract<User>> {
    const user = await this.userRepo.findOneBy({ email });
    let result: POSError | AuthContract<User> = null;

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
          const token = jwt.sign(
            {
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              phone_number: user.phone_number,
            },
            this.config.key,
            {
              expiresIn: this.config.token_expires_at,
            }
          );

          const refresh_token = jwt.sign(
            {
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              phone_number: user.phone_number,
            },
            this.config.key,
            {
              expiresIn: this.config.refresh_token_expires_at,
            }
          );

          const payload: AuthContract<User> = {
            token,
            refresh_token,
            user:
            expires_at: this.parseTimeExpression(this.config.token_expires_at),
            refresh_token_expires_at: this.parseTimeExpression(
              this.config.refresh_token_expires_at
            ),
          };

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
