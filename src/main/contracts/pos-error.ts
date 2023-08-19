export default interface POSError {
  code: number | string | null;
  message: string | null;
  verbose: any;
  type: 'POS_ERROR' | string;
}
