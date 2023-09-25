import { IpcMainInvokeEvent } from 'electron';
import ResponseContract from '../pos/pos.response.interface';
import StorageContract from '../storage/storage.interface';

export interface MiddlewarePropertiesContract extends IpcMainInvokeEvent {
  event: IpcMainInvokeEvent;
  eventData: Record<string, any>;
  storage: StorageContract;
  next: () => void;
}

export type MiddlewareContract = (
  props: MiddlewarePropertiesContract
) => ResponseContract | void;
