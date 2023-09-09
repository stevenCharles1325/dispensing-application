import ResponseContract from 'Main/contracts/response-contract';
import handleError from '../modules/error-handler';

const usePagination = async (
  query: any,
  page: number
): Promise<ResponseContract> => {
  try {
    const [entity, total] = await query.getManyAndCount();

    const pagination = {
      currentPage: page,
      previousPage: page <= 1 ? null : page - 1,
      nextPage: page >= total ? null : page + 1,
    };

    return {
      data: [entity, pagination],
      status: 'SUCCESS',
    };
  } catch (err) {
    const error = handleError(err);
    console.log(err);

    return {
      errors: [error],
      status: 'ERROR',
    };
  }
};

export default usePagination;
