import ResponseContract from 'Interfaces/pos/pos.response.interface';
import IMiddlewareProperties from './middleware.props.interface';

type IMiddleware = (props: IMiddlewareProperties) => ResponseContract | void;

export default IMiddleware;
