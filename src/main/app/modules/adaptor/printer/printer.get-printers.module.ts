/* eslint-disable consistent-return */

export default function getPrinters(
  this: any,
): void | Promise<boolean> | any {
  return this.printerAdaptor.getPrinters();
}
