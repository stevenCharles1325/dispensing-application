/* eslint-disable no-useless-catch */
import Provider from '@IOC:Provider';
import PrinterReceipt from 'App/adaptors/printer/printer.receipt.adaptor';
import IProvider from 'App/interfaces/provider/provider.interface';
import PrinterService from 'App/services/printer.service';

export default class PrinterProvider implements IProvider {
  constructor(public provider: typeof Provider) {}

  public run() {
    this.provider.singleton('PrinterProvider', () => {
      try {
        const printerAdaptor = new PrinterReceipt();

        return new PrinterService(printerAdaptor);
      } catch (err) {
        console.log('[PRINTER-ERROR]: ', err);
        throw err;
      }
    });
  }
}
