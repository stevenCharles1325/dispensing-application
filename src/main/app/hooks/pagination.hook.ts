import IPaginationHook from 'App/interfaces/pagination/pagination.hook.interface';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';

const usePagination: IPaginationHook = async <T>(
  query: any,
  page: number,
  pageSize: number = 15
): Promise<IResponse<IPagination<T> | IPOSError[]>> => {
  try {
    const [entity, total] = await query.getManyAndCount();

    const totalPage =
      Math.round(total / pageSize) + (total % pageSize > 0 ? 1 : 0);

    const pagination = {
      currentPage: page,
      previousPage: page <= 1 ? null : page - 1,
      nextPage: page >= totalPage ? null : page + 1,
      totalPage,
    };

    return {
      data: [entity as T[], pagination],
      code: 'REQ_OK',
      status: 'SUCCESS',
    } as IResponse<IPagination<T>>;
  } catch (err) {
    const error = handleError(err);
    console.log(err);

    return {
      errors: [error],
      code: 'SYS_ERR',
      status: 'ERROR',
    } as unknown as IResponse<IPOSError[]>;
  }
};

export default usePagination;
