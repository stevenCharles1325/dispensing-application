import IAuth from 'App/interfaces/auth/auth.interface';
import { User } from 'Main/database/models/user.model';

export default function getAuthToken(this: any): IAuth<User> {
  const authToken = this.getStore(this.AUTH_USER_TOKEN) as IAuth<User>;

  if (!authToken) {
    throw new Error('AuthToken is not available');
  }

  return authToken;
}
