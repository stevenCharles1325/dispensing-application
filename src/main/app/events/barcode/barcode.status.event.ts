import IEvent from "App/interfaces/event/event.interface";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IResponse from "App/interfaces/pos/pos.response.interface";
import handleError from "App/modules/error-handler.module";
import IEventListenerProperties from "App/interfaces/event/event.listener-props.interface";
import IDeviceInfo from "App/interfaces/barcode/barcode.device-info.interface";

export default class BarcodeStatusEvent implements IEvent {
  public channel: string = 'barcode:status';

  public async listener({
    globalStorage,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | IDeviceInfo | any>
  > {
    try {
      const selectedDevice: IDeviceInfo = globalStorage.get('HID:SELECTED');

      return {
        data: selectedDevice,
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
