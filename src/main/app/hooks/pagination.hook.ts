import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';

const usePagination = async (query: any, page: number): Promise<IResponse> => {
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
    } as IResponse;
  } catch (err) {
    const error = handleError(err);
    console.log(err);

    return {
      errors: [error],
      code: 'SYS_ERR',
      status: 'ERROR',
    } as IResponse;
  }
};

export default usePagination;
