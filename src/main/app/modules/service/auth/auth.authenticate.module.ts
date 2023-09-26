/* eslint-disable camelcase */

import IAuth from 'App/interfaces/auth/auth.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import parseTimeExpression from 'App/modules/parse-time-expression.module';
import TokenRepository from 'App/repositories/token.repository';
import { User } from 'Main/database/models/user.model';

export default async function authenticate(
  this: any,
  email: string,
  password: string
): Promise<IResponse> {
  const user = await this.userRepo.findOneBy({ email });
  let result: IPOSError | IAuth<User> | null = null;
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
        const payload: IAuth<User> = {
          token,
          refresh_token,
          user: user.serialize('password'),
          token_expires_at: parseTimeExpression(this.config.token_expires_at),
          refresh_token_expires_at: parseTimeExpression(
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

        this.setAuthUser(payload);
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
      data: this.getStore(this.AUTH_USER_TOKEN),
      code: 'AUTH_OK',
      status,
    } as IResponse;
  }

  return {
    errors: [result],
    code: 'AUTH_ERR',
    status,
  } as IResponse;
}
