import IResponse from '../pos/pos.response.interface';
import IMiddlewareProperties from './middleware.props.interface';

type IMiddleware<T> = (props: IMiddlewareProperties) => IResponse<T> | void;

export default IMiddleware;
