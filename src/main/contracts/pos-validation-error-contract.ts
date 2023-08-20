import POSError from './pos-error-contract';

export default interface POSValidationError extends POSError {
  field: string;
  type: 'POS_VALIDATION_ERROR';
}
