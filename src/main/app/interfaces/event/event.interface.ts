import IListener from './event.listener.interface';

export default interface IEvent {
  channel: string;
  is_preloaded?: boolean;
  middlewares?: Array<string>;
  listener: IListener;
}
