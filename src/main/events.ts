/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-template */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { join } from 'path';
import objectToFlattenArray from './app/modules/object-to-flatten-array';
import objectToFlattenObject from './app/modules/object-to-flatten-object';
import requireAll from './app/modules/require-all';
import EventContract from './contracts/event-contract';
import StorageContract from './contracts/storage-contract';
import { ALSStorage } from './stores';

const eventsObject = requireAll(join(__dirname, 'app/events'), true);
const middlewareObject = requireAll(join(__dirname, 'app/middlewares'), true);

function applyMiddleware(
  _middlewares: any[],
  eventListener: any,
  storage: StorageContract
) {
  return async (e: IpcMainInvokeEvent, ...args: any[]) => {
    let nextIndex = 0;

    const next = async () => {
      if (nextIndex < _middlewares.length) {
        console.log('Middleware has been applied.');
        const currentMiddleware = _middlewares[nextIndex];
        nextIndex++;
        await currentMiddleware({ event: e, eventArgs: args, next });
      } else {
        // All middlewares executed, call the final event listener
        return eventListener({ event: e, eventArgs: args, storage });
      }
    };

    return next();
  };
}

export default function () {
  let middlewares: Record<string, any> = {};

  if (middlewareObject) {
    middlewares = objectToFlattenObject(middlewareObject);
  }

  if (eventsObject) {
    const flattenEvents = objectToFlattenArray(eventsObject);
    const storage = ALSStorage();

    flattenEvents.forEach((eventInfo) => {
      const [_, EventClass] = eventInfo;

      const event: EventContract = new EventClass();

      const middlewareList =
        event.middlewares?.map(
          (middlewareFileName: string) => middlewares[middlewareFileName]
        ) || [];

      const listener = applyMiddleware(middlewareList, event.listener, storage);
      console.log('Initializing event channel: ', event.channel);

      ipcMain.handle(event.channel, listener);
    });
  }
}
