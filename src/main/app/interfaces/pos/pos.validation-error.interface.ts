import IPOSError from './pos.error.interface';

export default interface IPOSValidationError extends IPOSError {
  field: string;
  type: 'POS_VALIDATION_ERROR';
}
