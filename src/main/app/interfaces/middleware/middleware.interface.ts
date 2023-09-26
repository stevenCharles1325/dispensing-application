import IResponse from '../pos/pos.response.interface';
import IMiddlewareProperties from './middleware.props.interface';

type IMiddleware = (props: IMiddlewareProperties) => IResponse | void;

export default IMiddleware;
