import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ResponseContract from 'Contracts/response-contract';
import { SqliteDataSource } from '../../datasource';
import { User } from '../../models/User';

const userDelete = async (
  event: IpcMainInvokeEvent,
  id: number
): Promise<ResponseContract> => {
  const userRepo = SqliteDataSource.getRepository(User);
  const data = await userRepo.delete(id);

  return {
    data,
    errors: [],
  };
};

export default () => ipcMain.handle('user:delete', userDelete);
