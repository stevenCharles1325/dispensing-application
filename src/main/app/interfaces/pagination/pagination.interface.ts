type IPagination<T> = [
  Array<T>,
  {
    currentPage: number;
    previousPage: number | null;
    nextPage: number | null;
  }
];

export default IPagination;
