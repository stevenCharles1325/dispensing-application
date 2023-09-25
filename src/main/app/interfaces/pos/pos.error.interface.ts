export default interface POSError {
  code: number | string | null;
  message: string | null;
  verbose?: any | undefined;
  type: 'POS_ERROR' | string;
}
