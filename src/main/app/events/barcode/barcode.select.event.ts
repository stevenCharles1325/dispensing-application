import HID from "node-hid";
import IEvent from "App/interfaces/event/event.interface";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IResponse from "App/interfaces/pos/pos.response.interface";
import handleError from "App/modules/error-handler.module";
import HidDTO from "App/data-transfer-objects/hid.dto";
import IEventListenerProperties from "App/interfaces/event/event.listener-props.interface";
import IDeviceInfo from "App/interfaces/barcode/barcode.device-info.interface";
import barcodeMap from "Main/data/defaults/map/barcode-map";

export default class BarcodeSelectEvent implements IEvent {
  public channel: string = 'barcode:select';

  public async listener({
    eventData,
    globalStorage
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | void | any>
  > {
    try {
      const device: HidDTO = eventData.payload[0];

      if (device && device.vendorId && device.productId) {
        const selectedDevice = new HID.HID(device.vendorId, device.productId);

        const deviceCachedInfo: IDeviceInfo = {
          id: `${device.vendorId}:${device.productId}`,
          status: 'SUCCESS',
        }
        globalStorage.set('HID:SELECTED', deviceCachedInfo);

        global.emitToRenderer('BARCODE:STATUS', 'SUCCESS');

        let barcodeNumber = '';

        selectedDevice.on('data', (data) => {
          deviceCachedInfo.status = 'SUCCESS';
          const mappedNumber  = barcodeMap[data[2].toString()];

          if (mappedNumber && mappedNumber !== 'ENTER') {
            barcodeNumber += mappedNumber;
          }

          if (mappedNumber === 'ENTER') {
            global.emitToRenderer('BARCODE:STATUS', 'SUCCESS');
            global.emitToRenderer('BARCODE:DATA', barcodeNumber);
            barcodeNumber = '';
          }
        });

        selectedDevice.on('error', (err: any) => {
          const error = handleError(err) ?? 'Please try scanning again';

          deviceCachedInfo.status = 'ERROR';
          globalStorage.set('HID:SELECTED', deviceCachedInfo);

          console.log('HID ERROR: ', err);

          global.emitToRenderer('BARCODE:STATUS', 'ERROR');
          global.emitToRenderer('BARCODE:ERROR', error);

          selectedDevice.close();
        });

        return {
          code: 'REQ_OK',
          status: 'SUCCESS',
        };
      } else {
        const deviceCachedInfo = {
          id: `${device.vendorId}:${device.productId}`,
          status: 'ERROR',
        }
        globalStorage.set('HID:SELECTED', deviceCachedInfo);
        global.emitToRenderer('BARCODE:STATUS', 'ERROR');

        return {
          errors: ['Cannot open selected device'],
          code: 'REQ_ERR',
          status: 'ERROR',
        } as unknown as IResponse<IPOSError[]>;
      }
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', err);

      const deviceCachedInfo = {
        id: null,
        status: 'ERROR',
      }
      globalStorage.set('HID:SELECTED', deviceCachedInfo);
      global.emitToRenderer('BARCODE:STATUS', 'ERROR');

      return {
        errors: [error],
        code: 'REQ_ERR',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
