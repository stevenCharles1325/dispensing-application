/* eslint-disable no-restricted-syntax */
import { AsyncLocalStorage } from 'node:async_hooks';
import IStorage from './app/interfaces/storage/storage.interface';
import ElectronStore from 'electron-store';

type Callback = () => void;

const asyncLocalStorage = new AsyncLocalStorage();
const posGlobalStorage = new ElectronStore();

class Storage implements IStorage {
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

export function ALSStorage(): IStorage {
  return asyncLocalStorage.getStore() as IStorage;
}

export function GlobalStorage(): IStorage {
  return {
    storage: posGlobalStorage.store,
    set: posGlobalStorage.set,
    get: posGlobalStorage.get,
    delete: posGlobalStorage.delete,
    clear: posGlobalStorage.clear,
  } as unknown as IStorage;
}
