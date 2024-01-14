import HID from "node-hid";
import IEvent from "App/interfaces/event/event.interface";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IResponse from "App/interfaces/pos/pos.response.interface";
import handleError from "App/modules/error-handler.module";
import HidDTO from "App/data-transfer-objects/hid.dto";
import IEventListenerProperties from "App/interfaces/event/event.listener-props.interface";

export default class BarcodeDevicesEvent implements IEvent {
  public channel: string = 'barcode:devices';

  public async listener({
    globalStorage,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | HidDTO[] | any>
  > {
    try {
      const selectedDevice = globalStorage.get('HID:SELECTED');
      const result = await HID.devicesAsync();
      const devices = result.map(device => ({
        ...device,
        selected: selectedDevice?.id === `${device.vendorId}:${device.productId}`
      }));

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
