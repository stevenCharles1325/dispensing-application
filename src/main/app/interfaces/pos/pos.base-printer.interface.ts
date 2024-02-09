export default interface IBasePrinter {
  device?: any;
  printer?: any;
  getPrinters<T>(): Promise<T[]>;
  print(data: any, options?: Record<string, any>): Promise<void>;
}
