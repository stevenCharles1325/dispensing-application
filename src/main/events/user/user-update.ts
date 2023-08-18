import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ResponseContract from 'Contracts/response-contract';
import UserContract from 'Contracts/user-contract';
import { validate } from 'class-validator';
import { SqliteDataSource } from '../../datasource';
import { User } from '../../models/User';

const userUpdate = async (
  event: IpcMainInvokeEvent,
  id: number,
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

  const data = await userRepo.update(id, payload);
  return {
    data,
    errors: [],
  };
};

export default () => ipcMain.handle('user:update', userUpdate);
