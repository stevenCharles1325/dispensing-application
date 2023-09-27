import IListener from './event.listener.interface';

export default interface IEvent {
  channel: string;
  middlewares?: Array<string>;
  listener: IListener;
}
