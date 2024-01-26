/* eslint-disable camelcase */
/* eslint-disable no-prototype-builtins */

import IPrinterAdaptor from "App/interfaces/adaptor/printer/adaptor.printer.interface";
import IPrinterService from "App/interfaces/service/service.printer.interface";

import print from "App/modules/adaptor/printer/printer.print.module";
import getPrinters from "App/modules/adaptor/printer/printer.get-printers.module";

export default class PrinterService implements Partial<IPrinterService>
{
  public readonly SERVICE_NAME: 'PRINTER_SERVICE';

  constructor(public readonly printerAdaptor: IPrinterAdaptor) {}
}

Object.assign(PrinterService.prototype, {
  print,
  getPrinters,
});
