import Provider from '@IOC:Provider';
import AuthConfig from 'Main/config/auth';
import AuthService from 'Services/AuthService';
import UserRepository from 'Repositories/User-repository';
import bcrypt from 'bcrypt';

export default class AuthProvider {
  constructor(public provider: typeof Provider) {}

  public run() {
    this.provider.singleton('AuthProvider', () => {
      return new AuthService(AuthConfig, UserRepository, bcrypt);
    });
  }
}
