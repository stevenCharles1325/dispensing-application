import { ipcMain, IpcMainInvokeEvent } from 'electron';
import UserRepository from 'Repositories/User-repository';
import validator from 'Modules/validator';
import ResponseContract from 'Contracts/response-contract';
import UserContract from 'Contracts/user-contract';
import handleError from 'Modules/error-handler';

const userUpdate = async (
  event: IpcMainInvokeEvent,
  id: number,
  payload: Partial<UserContract>
): Promise<ResponseContract> => {
  try {
    const user = await UserRepository.findOneByOrFail({ id });
    user.merge(payload);

    const errors = await validator(user);

    if (errors.length) {
      return {
        errors,
        status: 'ERROR',
      };
    }

    const data = await UserRepository.save(user);
    return {
      data,
      errors: [],
      status: 'SUCCESS',
    };
  } catch (err) {
    console.log(err);

    const error = handleError(err);
    console.log('ERROR HANDLER OUTPUT: ', error);

    return {
      errors: [error],
      status: 'ERROR',
    };
  }
};

export default () => ipcMain.handle('user:update', userUpdate);
