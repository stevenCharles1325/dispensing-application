import { User } from 'Main/database/models/user.model';

export default function getAuthUser(this: any): Partial<User> {
  const authUser = this.getStore(this.AUTH_USER) as Partial<User>;

  if (!authUser) {
    throw new Error('AuthUser is not available');
  }

  return authUser;
}
