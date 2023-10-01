import IPagination from 'App/interfaces/pagination/pagination.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';

const usePagination = async (
  query: any,
  page: number
): Promise<IResponse<IPagination | IPOSError[]>> => {
  try {
    const [entity, total] = await query.getManyAndCount();

    const pagination = {
      currentPage: page,
      previousPage: page <= 1 ? null : page - 1,
      nextPage: page >= total ? null : page + 1,
    };

    return {
      data: [entity, pagination],
      code: 'REQ_OK',
      status: 'SUCCESS',
    } as IResponse<IPagination>;
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
