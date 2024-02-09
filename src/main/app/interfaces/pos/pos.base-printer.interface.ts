export default interface IBasePrinter {
  getPrinters<T>(): Promise<T[]>;
  print(data: any, options?: Record<string, any>): Promise<void>;
}
