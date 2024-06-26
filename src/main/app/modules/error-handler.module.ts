import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

type ErrorWithMessage = {
  message: string;
};

function hasMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (hasMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
}

export function getErrorMessage(error: any) {
  const err = toErrorWithMessage(error);

  return {
    code: error?.code,
    message: err.message,
    verbose: error,
    type: 'POS_ERROR',
  };
}

export default function handleError(
  error: any
): IPOSError | IPOSValidationError {
  try {
    if (error instanceof QueryFailedError) {
      console.log('MESSAGE: ', error.stack);
      try {
        const field = error.message.split(':')[2].split('.')[1];
        const code = (error as any).errno;

        // Error codes came from failed typeorm query.
        switch (code) {
          case 19:
            return {
              code,
              field,
              message: 'value already exists',
              verbose: error,
              type: 'POS_VALIDATION_ERROR',
            };

          default:
            return {
              code: 'UNKNOWN_CODE',
              message: 'Error cannot be distinguished by POSError handler',
              verbose: error,
              type: 'POS_ERROR',
            };
        }
      } catch {
        return {
          code: 'POS_QUERY_ERROR',
          message: error.message,
          verbose: error,
          type: 'POS_ERROR',
        };
      }
    }

    if (error instanceof EntityNotFoundError) {
      return {
        code: 'POS_NOT_FOUND',
        message: 'does not exist',
        verbose: error,
        type: 'POS_ERROR',
      };
    }

    return getErrorMessage(error);
  } catch {
    return error;
  }
}
