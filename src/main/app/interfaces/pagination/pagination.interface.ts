type IPagination = [
  any,
  {
    currentPage: number;
    previousPage: number | null;
    nextPage: number | null;
  }
];

export default IPagination;
