/* eslint-disable no-useless-catch */
import Provider from '@IOC:Provider';
import IProvider from 'App/interfaces/provider/provider.interface';
import UserRepository from 'App/repositories/user.repository';
import AuthService from 'App/services/auth.service';
import AuthConfig from 'Main/config/auth.config';
import { ALSStorage } from 'Main/stores';
import bcrypt from 'bcrypt';
import ElectronStore from 'electron-store';

export default class AuthProvider implements IProvider {
  constructor(public provider: typeof Provider) {}

  public run() {
    this.provider.singleton('AuthProvider', () => {
      try {
        const primaryStorage = ALSStorage();
        const backupStorage = new ElectronStore();

        const stores = [primaryStorage, backupStorage];

        return new AuthService(AuthConfig, UserRepository, bcrypt, stores);
      } catch (err) {
        console.log(err);
        throw err;
      }
    });
  }
}
