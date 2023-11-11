const EventEmitter = require('reactjs-eventemitter');

export interface IEventEmitter {
  events: Record<string, any>;
  dispatch(eventName: string, event: any): void;
  emit(eventName: string, event: any): void;
  subscribe<T>(eventName: string, callback: (data: T) => void): void;
}

const useEventEmitter = (): IEventEmitter => {
  return EventEmitter;
}

export default useEventEmitter;
