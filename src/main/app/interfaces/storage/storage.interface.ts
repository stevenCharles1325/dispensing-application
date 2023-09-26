export default interface IStorage {
  storage: Record<string, any>;
  set(key: string, value: any): void;
  get(key: string): any;
  delete(key: string): void;
  clear(): void;
}
