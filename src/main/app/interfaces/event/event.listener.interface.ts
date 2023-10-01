import IResponse from '../pos/pos.response.interface';
import IEventListenerProperties from './event.listener-props.interface';

type IListener = <T>(props: IEventListenerProperties) => Promise<IResponse<T>>;
export default IListener;
