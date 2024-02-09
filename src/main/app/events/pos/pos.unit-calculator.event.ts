import IEvent from "App/interfaces/event/event.interface";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IResponse from "App/interfaces/pos/pos.response.interface";
import handleError from "App/modules/error-handler.module";
import IEventListenerProperties from "App/interfaces/event/event.listener-props.interface";
import PrinterDTO from "App/data-transfer-objects/printer.dto";
import unitQuantityCalculator from "App/modules/unit-quantity-calculator.module";
import getUOFSymbol from "App/modules/get-uof-symbol.module";

export default class POSUnitCalculatorEvent implements IEvent {
  public channel: string = 'pos:unit-calculator';

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | PrinterDTO[] | any>
  > {
    try {
      const leftOperand = eventData.payload[0];
      const rightOperand = eventData.payload[1];
      const operation = eventData.payload[2];

      return {
        data: unitQuantityCalculator(
          leftOperand,
          rightOperand,
          getUOFSymbol,
          operation
        ),
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
