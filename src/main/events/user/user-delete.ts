import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { SqliteDataSource } from 'Main/datasource';
import { User } from 'Main/database/models/User';
import ResponseContract from 'Contracts/response-contract';

const userDelete = async (
  event: IpcMainInvokeEvent,
  id: number
): Promise<ResponseContract> => {
  const userRepo = SqliteDataSource.getRepository(User);
  const data = await userRepo.delete(id);

  return {
    data,
    errors: [],
    status: 'SUCCESS',
  };
};

export default () => ipcMain.handle('user:delete', userDelete);
