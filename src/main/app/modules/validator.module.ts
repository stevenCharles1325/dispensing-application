import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import { validate } from 'class-validator';

export default async function validator(this: any, model: object) {
  const validationErrors = await validate(model);
  let errors: Array<IPOSValidationError | null> = [];

  if (validationErrors) {
    errors = validationErrors.flatMap((err: any) => {
      const { property } = err;
      const constraints: string[] = Object.values(err.constraints);

      return constraints.map(
        (constraint: string) =>
          ({
            code: 'CLASS_VALIDATION_ERROR',
            field: property,
            message: constraint,
            verbose: null,
            type: 'POS_VALIDATION_ERROR',
          } as IPOSValidationError)
      );
    });
  }

  return errors;
}
