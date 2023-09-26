import IResponse from '../pos/pos.response.interface';
import IEventListenerProperties from './event.listener-props.interface';

type IListener = (props: IEventListenerProperties) => Promise<IResponse>;
export default IListener;
