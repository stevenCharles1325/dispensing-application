import IEvent from "App/interfaces/event/event.interface";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IResponse from "App/interfaces/pos/pos.response.interface";
import handleError from "App/modules/error-handler.module";
import IEventListenerProperties from "App/interfaces/event/event.listener-props.interface";
import { mainWindow } from "Main/main";
import PrinterDTO from "App/data-transfer-objects/printer.dto";

export default class PrinterDevicesEvent implements IEvent {
  public channel: string = 'printer:devices';

  public async listener({
    globalStorage,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | PrinterDTO[] | any>
  > {
    try {
      const cachedPrinterInfo: Partial<PrinterDTO> = globalStorage.get('PRINTER:SELECTED');
      const result = await mainWindow?.webContents.getPrintersAsync() as PrinterDTO[] ?? [];
      const devices = result.map((device) => {
        if (cachedPrinterInfo) {
          device.selected = device.displayName === cachedPrinterInfo?.displayName;
        } else {
          device.selected = device.isDefault;
        }

        return device;
      });

      return {
        data: devices,
        code: 'REQ_OK',
        status: 'SUCCESS',
      };
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        code: 'REQ_ERR',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
