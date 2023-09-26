/* eslint-disable no-plusplus */

import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IListener from 'App/interfaces/event/event.listener.interface';

export default function applyMiddleware(
  _middlewares: any[],
  eventListener: IListener
) {
  return async ({ event, eventData, storage }: IEventListenerProperties) => {
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
