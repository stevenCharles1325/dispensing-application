import { validate } from 'class-validator';
import POSValidationError from 'Main/app/interfaces/pos-validation-error-contract';

export default async function validator(model: object) {
  const validationErrors = await validate(model);
  let errors: Array<POSValidationError | null> = [];

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
          } as POSValidationError)
      );
    });
  }

  return errors;
}
