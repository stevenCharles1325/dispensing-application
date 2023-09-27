import { join } from 'path';
import { ipcMain } from 'electron';
import { ALSStorage } from './stores';

import IEvent from './app/interfaces/event/event.interface';
import IListener from './app/interfaces/event/event.listener.interface';

import requireAll from './app/modules/require-all.module';
import applyMiddleware from './app/modules/apply-middleware.module';
import objectToFlattenArray from './app/modules/object-to-flatten-array.module';
import objectToFlattenObject from './app/modules/object-to-flatten-object.module';

const eventsObject = requireAll(join(__dirname, 'app/events'), true);
const middlewareObject = requireAll(join(__dirname, 'app/middlewares'), true);

/*
  This is an event-reader. It reads all events from the App/Events folder
  and run it on the same order as what you see when you open any folder inside.
*/
export default function () {
  let middlewares: Record<string, any> = {};

  if (middlewareObject) {
    middlewares = objectToFlattenObject(middlewareObject);
  }

  if (eventsObject) {
    const flattenEvents = objectToFlattenArray(eventsObject);
    const storage = ALSStorage();

    const events: Record<string, IListener> = {};

    flattenEvents.forEach((eventInfo) => {
      const [_, EventClass] = eventInfo;

      const event: IEvent = new EventClass();

      const middlewareList =
        event.middlewares?.map((middlewareFileName: string) => {
          if (middlewareFileName.includes('.middleware')) {
            return middlewares[middlewareFileName];
          }

          return middlewares[`${middlewareFileName}.middleware`];
        }) || [];

      const listener = applyMiddleware(middlewareList, event.listener);
      console.log('Initializing event channel: ', event.channel);

      events[event.channel] = listener as unknown as IListener;
      ipcMain.handle(event.channel, (e, ...args: any[]) => {
        const eventData = {
          payload: args,
          user: {
            token: '',
          },
        };

        return listener({ event: e, eventData, storage });
      });
    });

    storage.set('POS_EVENTS', events);
  }
}
