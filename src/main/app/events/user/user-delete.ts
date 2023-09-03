import handleError from 'Main/app/modules/error-handler';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';
import { SqliteDataSource } from 'Main/datasource';
import { User } from 'Main/database/models/User';

export default class UserDeleteEvent implements EventContract {
  public channel: string = 'user:delete';

  public middlewares = ['auth-middleware'];

  public async listener({ eventData }: EventListenerPropertiesContract) {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('create-user');

      if (requesterHasPermission) {
        const userRepo = SqliteDataSource.getRepository(User);
        const data = await userRepo.delete(eventData.payload);

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
