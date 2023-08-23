import { ipcMain, IpcMainInvokeEvent } from 'electron';
import UserRepository from 'Main/app/repositories/User-repository';
import validator from 'Main/app/modules/validator';
import ResponseContract from 'Contracts/response-contract';
import UserContract from 'Contracts/user-contract';
import handleError from 'Main/app/modules/error-handler';

const userUpdate = async (
  event: IpcMainInvokeEvent,
  id: number,
  payload: Partial<UserContract>
): Promise<ResponseContract> => {
  try {
    const user = await UserRepository.findOneByOrFail({ id });
    const updatedUser = UserRepository.merge(user, payload);
    const errors = await validator(updatedUser);

    if (errors.length) {
      return {
        errors,
        status: 'ERROR',
      };
    }

    const data = await UserRepository.save(updatedUser);
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
