import Provider from '@IOC:Provider';
import AuthService from 'Services/AuthService';
import UserRepository from '../repositories/User-repository';
import { User } from 'Main/database/models/User';

async function authMiddleware() {
  const auth = Provider.ioc<AuthService>('AuthProvider');
  let user: User | null = null;

  if (auth.authUser) {
    // Getting the updated user from the database
    user = await UserRepository.findOneBy({ id: auth.authUser.user.id });
  }

  return { user };
}

export default authMiddleware;
