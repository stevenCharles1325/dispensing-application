import IPOSError from '../pos/pos.error.interface';
import IResponse from '../pos/pos.response.interface';
import IPagination from './pagination.interface';

type IPaginationHook = <T>(
  query: any,
  page: number,
  pageSize?: number
) => Promise<IResponse<IPagination<T> | IPOSError[]>>;

export default IPaginationHook;
