import IPrinterAdaptor from "App/interfaces/adaptor/printer/adaptor.printer.interface";
import { IPrintReceiptData } from "App/interfaces/pos/pos.printer.receipt.interface";
import escpos from 'escpos';

export default class PrinterReceipt implements Partial<IPrinterAdaptor> {
  public device;
  public printer;

  constructor () {
    try {
      escpos.USB = require('escpos-usb');
      this.device = new escpos.USB();
      this.printer = new escpos.Printer(this.device);
    } catch (err) {
      console.log('[PRINTER INITIALIZATION ERROR]: ', err);
      throw err;
    }
  }

  async print (
    data: IPrintReceiptData,
  ) {
    try {
      let error: any = null;

      for (const datum of data) {
        const keys = Object.keys(datum);

        for (const key of keys) {
          type DatumKey = keyof (typeof datum);
          const value = datum[key as DatumKey] as any;

          switch (key) {
            case 'text':
            case 'font':
            case 'feed':
            case 'align':
            case 'style':
            case 'lineSpace':
              if (value)
                this.printer[key](value);
              break;

            case 'drawLine':
              this.printer.drawLine();
              break;

            case 'size':
              this.printer.size(value!.width, value!.height);
              break;

            case 'tableCustom':
              this.printer.tableCustom(
                value.rows,
                value.options
              );
              break;

            default:
              this.printer.close((err) => {
                error = err;
                console.log('PRINT ERROR: (On default) ', err);
              });
              break;
          }
        }
      }

      this.printer.close((err) => {
        error = err;
        console.log('PRINT ERROR: ', err);
      });

      if (error) throw error;
    } catch (err) {
      console.log('PRINT ERROR: ', err);
      throw err;
    }
  }

  async getPrinters(): Promise<any[]> {
    return [];
  }
}

