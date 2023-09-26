import { IpcMainInvokeEvent } from 'electron';
import IStorage from '../storage/storage.interface';

export default interface IMiddlewareProperties extends IpcMainInvokeEvent {
  event: IpcMainInvokeEvent;
  eventData: Record<string, any>;
  storage: IStorage;
  next: () => void;
}
