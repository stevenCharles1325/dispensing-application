import HID from 'node-hid';
import IEvent from "App/interfaces/event/event.interface";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IResponse from "App/interfaces/pos/pos.response.interface";
import handleError from "App/modules/error-handler.module";
import IEventListenerProperties from "App/interfaces/event/event.listener-props.interface";
import IDeviceInfo from "App/interfaces/barcode/barcode.device-info.interface";
import { findByIds, Device } from 'usb';

export default class PrinterSelectEvent implements IEvent {
  public channel: string = 'printer:select';

  public async listener({
    eventData,
    globalStorage
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | void | any>
  > {
    try {
      const device: Device = eventData.payload[0];
      // const cachedHIDInfo: IDeviceInfo = globalStorage.get('HID:SELECTED:PRINTER');

      console.log(device);

      // Temporarily blocks this feature
      return {
        code: 'REQ_OK',
        status: 'SUCCESS',
      };

      // if (
      //   device &&
      //   device.deviceDescriptor.idVendor &&
      //   device.deviceDescriptor.idProduct
      // ) {
      //   if (cachedHIDInfo && cachedHIDInfo.id) {
      //     const [vendorId, productId] = cachedHIDInfo.id.split(':');

      //     if (
      //       device.deviceDescriptor.idVendor === Number(vendorId) &&
      //       device.deviceDescriptor.idProduct === Number(productId)
      //     ) {
      //       return {
      //         code: 'REQ_OK',
      //         status: 'SUCCESS',
      //       };
      //     }
      //   }

      //   const selectedDevice = await findByIds(
      //     device.deviceDescriptor.idVendor,
      //     device.deviceDescriptor.idProduct
      //   );

      //   selectedDevice?.__open();
      //   selectedDevice?.__open();

      //   const deviceCachedInfo: IDeviceInfo = {
      //     id: `${device.deviceDescriptor.idVendor}:${device.deviceDescriptor.idProduct}`,
      //     status: 'SUCCESS',
      //   }
      //   globalStorage.set('HID:SELECTED:PRINTER', deviceCachedInfo);

      //   global.emitToRenderer('PRINTER:STATUS', 'SUCCESS');

      //   return {
      //     code: 'REQ_OK',
      //     status: 'SUCCESS',
      //   };
      // } else {
      //   const deviceCachedInfo = {
      //     id: `${device.deviceDescriptor.idVendor}:${device.deviceDescriptor.idProduct}`,
      //     status: 'ERROR',
      //   }
      //   globalStorage.set('HID:SELECTED:PRINTER', deviceCachedInfo);
      //   global.emitToRenderer('PRINTER:STATUS', 'ERROR');

      //   return {
      //     errors: ['Cannot open selected device'],
      //     code: 'REQ_ERR',
      //     status: 'ERROR',
      //   } as unknown as IResponse<IPOSError[]>;
      // }
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', err);

      const deviceCachedInfo = {
        id: null,
        status: 'ERROR',
      }
      globalStorage.set('HID:SELECTED:PRINTER', deviceCachedInfo);
      global.emitToRenderer('PRINTER:STATUS', 'ERROR');

      return {
        errors: [error],
        code: 'REQ_ERR',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
