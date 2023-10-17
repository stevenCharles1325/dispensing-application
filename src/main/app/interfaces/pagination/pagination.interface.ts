type IPagination<T> = {
  data: Array<T>;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  totalPage: number;
};

export default IPagination;
