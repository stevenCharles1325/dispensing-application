/* eslint-disable camelcase */
import { User } from 'Main/database/models/user.model';
import jwt from 'jsonwebtoken';

export default function generateToken(
  this: any,
  payload: Partial<User>
): [string, string] {
  const token = jwt.sign(payload, this.config.key, {
    expiresIn: this.config.token_expires_at,
  });

  const refresh_token = jwt.sign(payload, this.config.key, {
    expiresIn: this.config.refresh_token_expires_at,
  });

  return [token, refresh_token];
}
