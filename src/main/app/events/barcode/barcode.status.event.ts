import IEvent from "App/interfaces/event/event.interface";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IResponse from "App/interfaces/pos/pos.response.interface";
import handleError from "App/modules/error-handler.module";
import IEventListenerProperties from "App/interfaces/event/event.listener-props.interface";
import IDeviceInfo from "App/interfaces/barcode/barcode.device-info.interface";
import HID from "node-hid";
import barcodeMap from "Main/data/defaults/map/barcode-map";

export default class BarcodeStatusEvent implements IEvent {
  public channel: string = 'barcode:status';

  public async listener({
    globalStorage,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IDeviceInfo | any>
  > {
    try {
      const cachedInfo: IDeviceInfo = globalStorage.get('HID:SELECTED');

      if (cachedInfo && cachedInfo.id && cachedInfo.status !== 'SUCCESS') {
        const [vendorId, productId] = cachedInfo.id.split(':');
        // let selectedDevice = await HID.HIDAsync.open(Number(vendorId), Number(productId));

        global.emitToRenderer('BARCODE:STATUS', 'SUCCESS');

        let barcodeNumber = '';

        // selectedDevice.on('data', (data) => {
        //   cachedInfo.status = 'SUCCESS';
        //   const mappedNumber  = barcodeMap[data[2].toString()];

        //   if (mappedNumber && mappedNumber !== 'ENTER') {
        //     barcodeNumber += mappedNumber;
        //   }

        //   if (mappedNumber === 'ENTER') {
        //     console.log('FROM HERE 2: ', barcodeNumber);
        //     global.emitToRenderer('BARCODE:STATUS', 'SUCCESS');
        //     global.emitToRenderer('BARCODE:DATA', barcodeNumber);
        //     barcodeNumber = '';
        //     return
        //   }
        // });

        // selectedDevice.on('error', async (err: any) => {
        //   cachedInfo.status = 'ERROR';
        //   globalStorage.set('HID:SELECTED', cachedInfo);

        //   console.log('HID ERROR: ', err);

        //   global.emitToRenderer('BARCODE:STATUS', 'ERROR');
        //   global.emitToRenderer('BARCODE:ERROR', err);

        //   return await selectedDevice.close();
        // });

        return {
          data: cachedInfo,
          code: 'REQ_OK',
          status: 'SUCCESS',
        };
      } else {
        return {
          errors: ['No device selected for barcode scanning'],
          code: 'REQ_ERR',
          status: 'ERROR',
        };
      }
    } catch (err) {
      const error = handleError(err);
      const deviceCachedInfo = {
        id: null,
        status: 'ERROR',
      }
      globalStorage.set('HID:SELECTED', deviceCachedInfo);
      global.emitToRenderer('BARCODE:STATUS', 'ERROR');
      global.emitToRenderer('BARCODE:ERROR', error);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error ?? 'Error connecting to HID device'],
        code: 'REQ_ERR',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
