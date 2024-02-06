import fs from "fs";
import { getPrinters  } from "pdf-to-printer";
import { IPrintOptions } from "App/interfaces/pos/pos.printer.interface";
import IPrinterAdaptor from "App/interfaces/adaptor/printer/adaptor.printer.interface";
import path from "path";
import { app } from "electron";
import concatDateToName from "App/modules/concat-date-to-name.module";
import nodeHtmlToImage from "node-html-to-image";
import Jimp from "jimp";
import IDeviceInfo from "App/interfaces/barcode/barcode.device-info.interface";
import { webusb } from 'usb';

export default class PrinterV2 implements Partial<IPrinterAdaptor> {
  async print (
    data: string,
    options?: IPrintOptions,
  ) {
    try {
      console.log('[PRINTING]: STARTING...');

      console.log('[PRINTING]: CONNECTING TO PRINTER...');
      const cachedPrinterInfo: Partial<IDeviceInfo> = options?.globalStorage?.get('PRINTER:SELECTED');
      console.log('[PRINTING]: PRINTER CONNECTED');

      if (cachedPrinterInfo && cachedPrinterInfo?.id) {
        const [vendorId, productId] = cachedPrinterInfo.id.split(':');
        const printer = await webusb.requestDevice({
          filters: [
            {
              vendorId: Number(vendorId),
              productId: Number(productId),
            }
          ]
        });

        await printer.open();
        await printer.selectConfiguration(0);
        await printer.claimInterface(0);

        const fileName = concatDateToName('xgen-pos-print');
        const tempPath = (ext: string = '.html') =>
          path.resolve(app.getPath('documents'), `${fileName + ext}`);

        const cleanUpFile = (path: string) => {
          if (path && fs.existsSync(path)) {
            fs.unlinkSync(path);
          }
        }

        await nodeHtmlToImage({
          output: tempPath('.png'),
          html: data,
        });
        console.log('[PRINTING]: CONVERTING TO IMAGE SUCCEEDED');

        console.log('[PRINTING]: LOOKING FOR THE CREATED IMAGE FILE...');
        let timeTaken = 0;
        while (true) {
          timeTaken += 1;
          console.log('[PRINTING]: TIME TAKEN IN SECONDS: ', timeTaken / 1000);

          if (fs.existsSync(tempPath('.png'))) {
            console.log('[PRINTING]: PRINTING IMAGE...');
            const image = await Jimp.read(tempPath('.png'));
            const bitmapHex = image.bitmap.data.toString('hex');

            if (printer.opened) {
              console.log(printer.configuration?.interfaces);
              // console.log(printer.configuration?.interfaces[0].alternate.endpoints[0])
              // printer.transferOut(
              //   printer.configuration?.interfaces[0].alternate.endpoints[0],
              //   bitmapHex
              // )
            }
            // NODE HID WRITE TO DEVICE
            break;
          }
        }

        console.log('CLEANING UP CREATED HTML AND PDF FILES...');
        // cleanUpFile(`${fileName}.pdf`);
        cleanUpFile(`${fileName}.html`);
      } else {
        throw new Error('No selected printer. Please select one first.');
      }
    } catch (err) {
      console.log('PRINT ERROR: ', err);
      throw err;
    }
  }

  async getPrinters(): Promise<any[]> {
    return getPrinters();
  }
}
