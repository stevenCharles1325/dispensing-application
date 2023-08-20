import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { User } from 'Main/database/models/User';
import UserRepository from 'Main/repositories/User-repository';
import handleError from 'Modules/error-handler';
import validator from 'Modules/validator';
import UserContract from 'Contracts/user-contract';
import ResponseContract from 'Contracts/response-contract';

const userCreate = async (
  event: IpcMainInvokeEvent,
  payload: UserContract
): Promise<ResponseContract> => {
  try {
    const user = new User();
    user.first_name = payload.first_name;
    user.last_name = payload.last_name;
    user.email = payload.email;
    user.password = payload.password;
    user.phone_number = payload.phone_number;
    user.address = payload.address;
    user.birth_date = payload.birth_date;

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
