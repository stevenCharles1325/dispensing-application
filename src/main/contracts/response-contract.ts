import { ValidationError } from 'class-validator';
import POSError from './pos-error';
import POSValidationError from './pos-validation-error';

export default interface ResponseContract {
  data?: any;
  errors?:
    | Array<
        POSError | POSValidationError | ValidationError | Error | string | null
      >
    | undefined;
  status: 'SUCCESS' | 'ERROR' | 'PENDING';
}
