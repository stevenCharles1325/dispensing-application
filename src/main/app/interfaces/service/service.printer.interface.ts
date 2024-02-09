import IPrinterAdaptor from '../adaptor/printer/adaptor.printer.interface';
import IBasePrinter from '../pos/pos.printer.pdf.interface';
import IService from './service.interface';

export default interface IPrinterService extends IService, IBasePrinter {
  readonly printerAdaptor: IPrinterAdaptor;
}
