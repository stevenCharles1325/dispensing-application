import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { User } from 'Main/database/models/User';
import UserRepository from 'Main/app/repositories/User-repository';
import handleError from 'Main/app/modules/error-handler';
import validator from 'Main/app/modules/validator';
import UserContract from 'Contracts/user-contract';
import ResponseContract from 'Contracts/response-contract';

const userCreate = async (
  event: IpcMainInvokeEvent,
  payload: UserContract
): Promise<ResponseContract> => {
  try {
    const user = UserRepository.create(payload);
    const errors = await validator(user);
    if (errors && errors.length) {
      return {
        errors,
        status: 'ERROR',
      };
    }

    const data = await UserRepository.save(user);
    return {
      data,
      status: 'SUCCESS',
    };
  } catch (err) {
    const error = handleError(err);
    console.log('ERROR HANDLER OUTPUT: ', error);

    return {
      errors: [error],
      status: 'ERROR',
    };
  }
};

export default () => ipcMain.handle('user:create', userCreate);
