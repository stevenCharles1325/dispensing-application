import HID from "node-hid";
import IEvent from "App/interfaces/event/event.interface";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IResponse from "App/interfaces/pos/pos.response.interface";
import handleError from "App/modules/error-handler.module";
import HidDTO from "App/data-transfer-objects/hid.dto";
import IEventListenerProperties from "App/interfaces/event/event.listener-props.interface";

export default class BarcodeSelectEvent implements IEvent {
  public channel: string = 'barcode:select';

  public async listener({
    eventData
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | void | any>
  > {
    try {
      const device: HidDTO = eventData.payload[0];

      if (device && device.path) {
        const selectedDevice = new HID.HID(device.path);

        selectedDevice.on('data', (data) => {
          global.emitToRenderer('BARCODE:DATA', data.toString('utf8'));
        });

        selectedDevice.on('error', (err: any) => {
          const error = handleError(err) ?? 'Please try scanning again';

          global.emitToRenderer('BARCODE:ERROR', error);
        });
      } else {
        return {
          errors: ['Cannot find path for the selected device'],
          code: 'REQ_ERR',
          status: 'ERROR',
        } as unknown as IResponse<IPOSError[]>;
      }

      return {
        code: 'REQ_OK',
        status: 'ERROR',
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
