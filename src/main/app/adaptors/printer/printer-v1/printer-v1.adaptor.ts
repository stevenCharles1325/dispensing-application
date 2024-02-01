import fs from "fs";
import { print, getPrinters  } from "pdf-to-printer";
import { IPrintOptions } from "App/interfaces/pos/pos.printer.interface";
import IPrinterAdaptor from "App/interfaces/adaptor/printer/adaptor.printer.interface";
import path from "path";
import { app } from "electron";
import concatDateToName from "App/modules/concat-date-to-name.module";
import htmlToPDF from "App/modules/html-to-pdf.module";

export default class PrinterV1 implements Partial<IPrinterAdaptor> {
  async print (
    data: string,
    options?: IPrintOptions,
  ) {
    try {
      const printOptions = options || {
        pages: '1',
        scale: 'noscale',
        paperSize: '58(48) x 210 mm'
      };

      const fileName = concatDateToName('xgen-pos-print');
      const tempPath = (ext: string = '.html') =>
        path.resolve(app.getPath('documents'), `${fileName + ext}`);

      const cleanUpFile = (path: string) => {
        if (path && fs.existsSync(path)) {
          fs.unlinkSync(path);
        }
      }

      console.log('CREATING HTML RECEIPT...');
      fs.writeFileSync(tempPath(), data, 'utf-8');

      console.log('CONVERTING HTML RECEIPT TO PDF...');
      await htmlToPDF(tempPath(), tempPath('.pdf'));

      console.log('LOOKING FOR THE CREATED PDF FILE...');
      let timeTaken = 0;
      while (true) {
        timeTaken += 1;
        console.log('TIME TAKEN IN SECONDS: ', timeTaken / 1000);
        if (fs.existsSync(tempPath('.pdf'))) {
          console.log('PRINTING PDF...');
          await print(tempPath('.pdf'), printOptions);
          break;
        }
      }

      console.log('CLEANING UP CREATED HTML AND PDF FILES...');
      // cleanUpFile(`${fileName}.pdf`);
      cleanUpFile(`${fileName}.html`);
    } catch (err) {
      console.log('PRINT ERROR: ', err);
    }
  }

  async getPrinters(): Promise<any[]> {
    return getPrinters();
  }
}
