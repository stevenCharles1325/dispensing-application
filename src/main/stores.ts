/* eslint-disable no-restricted-syntax */
import { AsyncLocalStorage } from 'node:async_hooks';
import StorageContract from './contracts/storage-contract';

type Callback = () => void;
const asyncLocalStorage = new AsyncLocalStorage();

class Storage implements StorageContract {
  constructor(public storage: Record<string, any> = {}) {}

  get(key: string): any {
    return this.storage[key];
  }

  set(key: string, value: any): void {
    this.storage[key] = value;
  }

  delete(key: string): void {
    delete this.storage[key];
  }

  clear(): void {
    this.storage = {};
  }
}

export default function (callback: Callback) {
  const storage = new Storage();
  asyncLocalStorage.enterWith(storage);
  callback();
}

export function ALSStorage(): StorageContract {
  return asyncLocalStorage.getStore() as StorageContract;
}
