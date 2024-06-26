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
                if (!value) break;

                _printer = printer[key](value);
                break;

              case 'drawLine':
                _printer = printer.drawLine();
                break;

              case 'size':
                _printer = printer.size(value!.width, value!.height);
                break;

              case 'tableCustom':
                if (!value || !value.rows?.length) break;

                _printer = printer.tableCustom(
                  value.rows,
                  value.options
                );
                break;

              case 'barcode':
                if (!value?.code || !value?.type) break;

                _printer = printer.barcode(
                  value.code,
                  value.type ?? 'EAN13'
                );
                break;

              default:
                _printer = printer.close((err) => {
                  if (err) {
                    error = err;
                    console.log('PRINT ERROR: ', err);
                  }

                  device.close((closeErr) => {
                    if (closeErr) {
                      error = closeErr;
                      console.log('PRINT ERROR: ', closeErr);
                    }
                  });
                });
                break;
            }
          }
        }

        _printer.close((err) => {
          if (err) {
            error = err;
            console.log('PRINT ERROR: ', err);
          }

          device.close((closeErr) => {
            if (closeErr) {
              error = closeErr;
              console.log('PRINT ERROR: ', closeErr);
            }
          });
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

