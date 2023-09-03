import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import { SqliteDataSource } from 'Main/datasource';
import { User } from 'Main/database/models/User';

export default class UserDeleteEvent implements EventContract {
  public channel: string = 'user:delete';

  public middlewares = ['auth-middleware'];

  public async listener({
    eventArgs,
    storage,
  }: EventListenerPropertiesContract) {
    try {
      const authUser = storage.get('POS_AUTH_USER') as User;
      const hasPermission = authUser.hasPermission('delete-user');

      if (hasPermission) {
        const userRepo = SqliteDataSource.getRepository(User);
        const data = await userRepo.delete(eventArgs[0]);

        return {
          data,
          errors: [],
          status: 'SUCCESS',
        };
      }

      return {
        errors: ['You are not allowed to create a User'],
        status: 'ERROR',
      };
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);
      return {
        errors: [error],
        status: 'ERROR',
      };
    }
  }
}

// import { ipcMain, IpcMainInvokeEvent } from 'electron';
// import { SqliteDataSource } from 'Main/datasource';
// import { User } from 'Main/database/models/User';
// import ResponseContract from 'Contracts/response-contract';
// import StorageContract from 'Main/contracts/storage-contract';
// import { ALSStorage } from 'Main/stores';

// const userDelete =
//   (storage: StorageContract) =>
//   async (event: IpcMainInvokeEvent, id: number): Promise<ResponseContract> => {
//     const userRepo = SqliteDataSource.getRepository(User);
//     const data = await userRepo.delete(id);

//     return {
//       data,
//       errors: [],
//       status: 'SUCCESS',
//     };
//   };

// export default () => {
//   const storage = ALSStorage();
//   ipcMain.handle('user:delete', userDelete(storage));
// };
