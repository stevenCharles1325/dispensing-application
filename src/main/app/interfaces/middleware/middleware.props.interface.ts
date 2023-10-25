import { IpcMainInvokeEvent } from 'electron';
import IStorage from '../storage/storage.interface';

export default interface IMiddlewareProperties extends IpcMainInvokeEvent {
  event: IpcMainInvokeEvent;
  channelName: string;
  eventData: Record<string, any>;
  localStorage: IStorage;
  globalStorage: IStorage;
  next: () => void;
}
