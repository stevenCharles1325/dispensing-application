/* eslint-disable no-restricted-syntax */
import { join } from 'path';
import { AsyncLocalStorage } from 'node:async_hooks';
import requireAll from 'App/modules/require-all';

type Callback = () => void;
const asyncLocalStorage = new AsyncLocalStorage();

const stores = requireAll(join(__dirname, 'app/stores'), true);

export default function (callback: Callback) {
  let obj = {};

  if (stores) {
    Object.values(stores).forEach((store) => {
      const val = store();

      if (val) {
        const entries = Object.entries(val);

        for (const [name, value] of entries) {
          obj = { ...obj, [name]: value };
        }
      }
    });
  }

  asyncLocalStorage.run(obj, callback);
}
