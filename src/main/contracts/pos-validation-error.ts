import POSError from './pos-error';

export default interface POSValidationError extends POSError {
  field: string;
  type: 'POS_VALIDATION_ERROR';
}
