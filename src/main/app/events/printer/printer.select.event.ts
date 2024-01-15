import IEvent from "App/interfaces/event/event.interface";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IResponse from "App/interfaces/pos/pos.response.interface";
import handleError from "App/modules/error-handler.module";
import IEventListenerProperties from "App/interfaces/event/event.listener-props.interface";
import PrinterDTO from "App/data-transfer-objects/printer.dto";

export default class PrinterSelectEvent implements IEvent {
  public channel: string = 'printer:select';

  public async listener({
    eventData,
    globalStorage
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | void | any>
  > {
    try {
      const device: PrinterDTO = eventData.payload[0];
      globalStorage.set(
        'PRINTER:SELECTED',
        {
          displayName: device.displayName
        }
      );

      return {
        code: 'REQ_OK',
        status: 'SUCCESS',
      }
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', err);

      return {
        errors: [error],
        code: 'REQ_ERR',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
