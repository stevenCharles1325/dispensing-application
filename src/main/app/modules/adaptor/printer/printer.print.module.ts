/* eslint-disable consistent-return */

export default function print(
  this: any,
  data: Record<string, any>,
): void | Promise<boolean> | any {
  return this.printerAdaptor.print(data);
}
