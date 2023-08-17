import { ipcMain, IpcMainInvokeEvent } from 'electron';
import UserContract from 'main/contracts/user-contract';
import { SqliteDataSource } from 'main/datasource';
import { User } from 'main/models/User';
// import { validate } from 'class-validator';

const userCreate = async (
  event: IpcMainInvokeEvent,
  payload: UserContract
): Promise<User> => {
  const user = new User();
  user.first_name = payload.first_name;
  user.last_name = payload.last_name;
  user.email = payload.email;
  user.password = payload.password;
  user.phone_number = payload.phone_number;
  user.address = payload.address;
  user.birth_date = payload.birth_date;

  const userRepo = SqliteDataSource.getRepository(User);

  return userRepo.save(user);
};

export default () => ipcMain.handle('user:create', userCreate);
