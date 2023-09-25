import { IpcMainInvokeEvent } from 'electron';
import ResponseContract from '../pos/pos.response.interface';
import StorageContract from '../storage/storage.interface';
import { PermissionsKebabType } from 'Main/data/defaults/permissions';

interface EventDataPropertiesContract {
  payload: any[];
  user: {
    token?: string;
    /*
      'hasPermission' is a method from AuthService that takes
      the User as the first argument, therefore, you must bind it
      to this method before assigning it in EventData property.
    */
    hasPermission?: (...permission: PermissionsKebabType[]) => boolean;
  };
}

export interface EventListenerPropertiesContract {
  event: IpcMainInvokeEvent;
  eventData: EventDataPropertiesContract;
  storage: StorageContract;
}

export type Listener = (
  props: EventListenerPropertiesContract
) => Promise<ResponseContract>;

export default interface EventContract {
  channel: string;
  middlewares?: Array<string>;
  listener: Listener;
}
