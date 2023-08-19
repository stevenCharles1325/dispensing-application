/* eslint-disable import/prefer-default-export */
import POSError from 'Contracts/pos-error';
import POSValidationError from 'Contracts/pos-validation-error';
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

export default function handleError(error: any): POSError | POSValidationError {
  if (error instanceof QueryFailedError) {
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
}
