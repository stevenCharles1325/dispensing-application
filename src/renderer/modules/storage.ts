class LocalStorage {
  constructor() {}

  getItem(key: string): any {
    return JSON.parse(window.storage.get(key));
  }

  setItem(key: string, value: any): void {
    window.storage.set(key, JSON.stringify(value));
  }

  removeItem(key: string): void {
    window.storage.remove(key);
  }
}

const localStorage = new LocalStorage();
export default localStorage;
