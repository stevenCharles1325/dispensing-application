import { IpcMainInvokeEvent } from 'electron';
import IEventDataProperties from './event.data-props.interface';
import IStorage from '../storage/storage.interface';

export default interface IEventListenerProperties {
  event: IpcMainInvokeEvent;
  eventData: IEventDataProperties;
  storage: IStorage;
}
