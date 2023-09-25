import Provider from '@IOC:Provider';
import AuthConfig from 'Main/config/auth';
import AuthService from 'Main/app/services/auth.service';
import UserRepository from 'Repositories/User-repository';
import bcrypt from 'bcrypt';
import ProviderContract from 'Main/app/interfaces/provider-contract';

export default class AuthProvider implements ProviderContract {
  constructor(public provider: typeof Provider) {}

  public run() {
    this.provider.singleton('AuthProvider', () => {
      return new AuthService(AuthConfig, UserRepository, bcrypt);
    });
  }
}
