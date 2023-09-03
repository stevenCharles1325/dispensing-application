import { IpcMainInvokeEvent } from "electron";
import ResponseContract from "./response-contract";
import StorageContract from "./storage-contract";

export interface MiddlewarePropertiesContract extends IpcMainInvokeEvent {
  event: IpcMainInvokeEvent;
  eventArgs: any[];
  storage: StorageContract;
  next: () => void;
}

export type MiddlewareContract = (props: MiddlewarePropertiesContract) => ResponseContract;