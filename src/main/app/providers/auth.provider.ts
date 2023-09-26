import Provider from '@IOC:Provider';
import AuthConfig from 'Config/auth.config';
import IProvider from 'Interfaces/provider/provider.interface';
import AuthService from 'Main/app/services/auth.service';
import UserRepository from 'Repositories/user.repository';
import bcrypt from 'bcrypt';

export default class AuthProvider implements IProvider {
  constructor(public provider: typeof Provider) {}

  public run() {
    this.provider.singleton('AuthProvider', () => {
      return new AuthService(AuthConfig, UserRepository, bcrypt);
    });
  }
}
