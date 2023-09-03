/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-template */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */
import { ipcMain } from 'electron';
import { join } from 'path';
import objectToFlattenArray from './app/modules/object-to-flatten-array';
import objectToFlattenObject from './app/modules/object-to-flatten-object';
import requireAll from './app/modules/require-all';
import EventContract, {
  EventListenerPropertiesContract,
  Listener,
} from './contracts/event-contract';
import { ALSStorage } from './stores';

const eventsObject = requireAll(join(__dirname, 'app/events'), true);
const middlewareObject = requireAll(join(__dirname, 'app/middlewares'), true);

function applyMiddleware(_middlewares: any[], eventListener: Listener) {
  return async ({
    event,
    eventData,
    storage,
  }: EventListenerPropertiesContract) => {
    let nextIndex = 0;

    const next = async () => {
      if (nextIndex < _middlewares.length) {
        const currentMiddleware = _middlewares[nextIndex];
        nextIndex++;

        return currentMiddleware({ event, eventData, storage, next });
      }

      // All middlewares executed, call the final event listener
      return eventListener({ event, eventData, storage });
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

    const events: Record<string, Listener> = {};

    flattenEvents.forEach((eventInfo) => {
      const [_, EventClass] = eventInfo;

      const event: EventContract = new EventClass();

      const middlewareList =
        event.middlewares?.map(
          (middlewareFileName: string) => middlewares[middlewareFileName]
        ) || [];

      const listener = applyMiddleware(middlewareList, event.listener);
      console.log('Initializing event channel: ', event.channel);

      events[event.channel] = listener as unknown as Listener;
      ipcMain.handle(event.channel, (e, ...args: any[]) => {
        const eventData = {
          payload: args,
          user: {
            token: '',
          }
        };

        listener({ event: e, eventData, storage });
      });
    });

    storage.set('POS_EVENTS', events);
  }
}
