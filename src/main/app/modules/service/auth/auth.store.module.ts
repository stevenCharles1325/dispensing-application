/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */

// SET STORE
export function setStore(this: any, key: string, value: any): void {
  if (!this.stores.length) {
    return;
  }

  try {
    for (const store of this.stores) {
      store.set(key, value);
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// GET STORE
export function getStore(this: any, key: string): any {
  if (!this.stores.length) {
    return null;
  }

  for (const store of this.stores) {
    const desiredValue = store.get(key);

    if (desiredValue) {
      return desiredValue;
    }
  }

  return null;
}

// CLEAR STORE
export function clearStore(this: any): void {
  if (!this.stores.length) {
    return;
  }

  for (const store of this.stores) {
    store.clear();
  }
}
