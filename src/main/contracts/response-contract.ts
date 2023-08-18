import { ValidationError } from 'class-validator';

export default interface ResponseContract {
  data: any;
  errors?: Array<ValidationError | Error | string | null> | undefined;
}
