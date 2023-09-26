import IAuth from 'App/interfaces/auth/auth.interface';
import { User } from 'Main/database/models/user.model';

export default function setAuthUser(this: any, payload: IAuth<User>) {
  this.setStore(this.AUTH_USER_TOKEN, payload);
  this.setStore(this.AUTH_USER, payload.user);
}
