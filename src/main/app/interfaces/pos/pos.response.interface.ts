import { ValidationError } from 'class-validator';
import IPOSError from './pos.error.interface';
import IPOSValidationError from './pos.validation-error.interface';
import IResponseCode from './pos.response-code.interface';

export default interface IResponse {
  data?: any;
  errors?:
    | Array<
        | IPOSError
        | IPOSValidationError
        | ValidationError
        | Error
        | string
        | null
      >
    | undefined;
  code: IResponseCode;
  status: 'SUCCESS' | 'ERROR' | 'PENDING';
}
