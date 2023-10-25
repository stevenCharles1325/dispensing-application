/* eslint-disable no-plusplus */

import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IListener from 'App/interfaces/event/event.listener.interface';

export default function applyMiddleware(
  _middlewares: any[],
  channelName: string,
  eventListener: IListener
) {
  return async ({
    event,
    eventData,
    localStorage,
    globalStorage,
  }: IEventListenerProperties) => {
    let nextIndex = 0;

    const next = async () => {
      if (nextIndex < _middlewares.length) {
        const currentMiddleware = _middlewares[nextIndex];
        nextIndex++;

        return currentMiddleware({
          event,
          channelName,
          eventData,
          localStorage,
          globalStorage,
          next,
        });
      }

      // All middlewares executed, call the final event listener
      return eventListener({ event, eventData, localStorage, globalStorage });
    };

    return next();
  };
}
