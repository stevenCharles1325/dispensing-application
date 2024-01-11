class LocalStorage {
  constructor() {}

  getItem(key: string): any {
    const result = window.storage.get(key);

    if (result) return JSON.parse(result);

    return null;
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
