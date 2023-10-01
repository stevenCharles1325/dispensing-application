import IResponseCode from './pos.response-code.interface';

export default interface IResponse<T> {
  data?: T | undefined;
  errors?: Array<T> | undefined;
  code: IResponseCode;
  status: 'SUCCESS' | 'ERROR' | 'PENDING';
}
