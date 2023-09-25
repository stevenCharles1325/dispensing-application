import POSError from './pos.error.interface';

export default interface POSValidationError extends POSError {
  field: string;
  type: 'POS_VALIDATION_ERROR';
}
