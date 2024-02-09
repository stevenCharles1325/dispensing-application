import IPrinterAdaptor from "App/interfaces/adaptor/printer/adaptor.printer.interface";
import { IPrintReceiptData } from "App/interfaces/pos/pos.printer.receipt.interface";
import escpos from 'escpos';

export default class PrinterReceipt implements Partial<IPrinterAdaptor> {
  async print (
    data: IPrintReceiptData,
  ) {
    try {
      escpos.USB = require('escpos-usb');
      const device = new escpos.USB();
      const printer = new escpos.Printer(device);
      
      let error: any = null;

      device.open((err) => {
        if (err) {
          error = err;
          console.log('PRINT ERROR: ', err);
        }

        let _printer = printer;

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
                _printer = printer[key](value);
                break;
  
              case 'drawLine':
                _printer = printer.drawLine();
                break;
  
              case 'size':
                _printer = printer.size(value!.width, value!.height);
                break;
  
              case 'tableCustom':
                _printer = printer.tableCustom(
                  value.rows,
                  value.options
                );
                break;
  
              default:
                _printer = printer.close((err) => {
                  error = err;
                  console.log('PRINT ERROR: (On default) ', err);
                });
                break;
            }
          }
        }
  
        _printer.close((err) => {
          error = err;
          console.log('PRINT ERROR: ', err);
        });
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

