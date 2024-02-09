import IEvent from "App/interfaces/event/event.interface";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IResponse from "App/interfaces/pos/pos.response.interface";
import handleError from "App/modules/error-handler.module";
import IEventListenerProperties from "App/interfaces/event/event.listener-props.interface";
import PrinterDTO from "App/data-transfer-objects/printer.dto";
import IDeviceInfo from "App/interfaces/barcode/barcode.device-info.interface";
import { getDeviceList } from 'usb';

export default class PrinterDevicesEvent implements IEvent {
  public channel: string = 'printer:devices';

  public async listener({
    globalStorage,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | PrinterDTO[] | any>
  > {
    try {
      const cachedPrinterInfo: Partial<IDeviceInfo> = globalStorage.get('PRINTER:SELECTED');
      // const result = getDeviceList() as PrinterDTO[];

      // const devices = result.map((device) => {
      //   if (cachedPrinterInfo) {
      //     device['selected'] = `${
      //       device.deviceDescriptor.idVendor
      //     }:${
      //       device.deviceDescriptor.idProduct
      //     }` === cachedPrinterInfo.id;

      //     return device;
      //   }

      //   device['selected'] = false;
      //   return device;
      // });

      return {
        data: [],
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
