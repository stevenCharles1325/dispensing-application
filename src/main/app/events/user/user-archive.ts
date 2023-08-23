import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { SqliteDataSource } from 'Main/datasource';
import { User } from 'Main/database/models/User';
import ResponseContract from 'Contracts/response-contract';

const userArchive = async (
  event: IpcMainInvokeEvent,
  id: number
): Promise<ResponseContract> => {
  const userRepo = SqliteDataSource.getRepository(User);
  const data = await userRepo.softDelete(id);

  return {
    data,
    errors: [],
    status: 'SUCCESS',
  };
};

export default () => ipcMain.handle('user:archive', userArchive);
