import { IpcMainInvokeEvent } from 'electron';
import ResponseContract from './response-contract';
import StorageContract from './storage-contract';

export interface EventListenerPropertiesContract {
  event: IpcMainInvokeEvent;
  eventArgs: any[];
  storage: StorageContract;
}

type Listener = (
  event: EventListenerPropertiesContract
) => Promise<ResponseContract | any>;

export default interface EventContract {
  channel: string;
  middlewares?: Array<string>;
  listener: Listener;
}
