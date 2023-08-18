import { ipcMain, IpcMainInvokeEvent } from 'electron';
import UserContract from 'Contracts/user-contract';
import ResponseContract from 'Contracts/response-contract';
import { validate } from 'class-validator';
import { SqliteDataSource } from '../../datasource';
import { User } from '../../models/User';

const userCreate = async (
  event: IpcMainInvokeEvent,
  payload: UserContract
): Promise<ResponseContract> => {
  const userRepo = SqliteDataSource.getRepository(User);
  const errors = await validate(payload);

  if (errors.length) {
    return {
      data: null,
      errors,
    };
  }

  const user = new User();
  user.first_name = payload.first_name;
  user.last_name = payload.last_name;
  user.email = payload.email;
  user.password = payload.password;
  user.phone_number = payload.phone_number;
  user.address = payload.address;
  user.birth_date = payload.birth_date;

  const data = await userRepo.save(user);
  return {
    data,
    errors: [],
  };
};

export default () => ipcMain.handle('user:create', userCreate);
