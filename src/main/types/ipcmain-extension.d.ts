import { IpcMainInvokeEvent } from 'electron';

declare global {
  interface POSResponse {
    data: any;
    errors: any[];
  }

  namespace electron {
    interface IpcMain {
      handle(
        channel: string,
        listener: (
          event: IpcMainInvokeEvent,
          ...args: any[]
        ) => Promise<POSResponse>
      ): void;
    }
  }
}
