import { ValidationError } from 'class-validator';
import POSError from './pos-error-contract';
import POSValidationError from './pos-validation-error-contract';

export default interface ResponseContract {
  data?: any;
  errors?:
    | Array<
        POSError | POSValidationError | ValidationError | Error | string | null
      >
    | undefined;
  status: 'SUCCESS' | 'ERROR' | 'PENDING';
}
