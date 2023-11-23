import useAlert from "./useAlert";
import IPOSValidationError from "App/interfaces/pos/pos.validation-error.interface";

type ErrorCB = (field: string | null, message: string) => void;

interface ErrorParams {
  errors: any;
  onError?: ErrorCB;
  displayError?: boolean;
}

type ErrorHandler = (params: ErrorParams) => string;

const useErrorHandler = () => {
  const { displayAlert } = useAlert();

  const errorHandler: ErrorHandler = ({ errors, onError, displayError = true }) => {
    try {
      if (typeof errors?.[0] === 'string') {
        const message = errors[0];

        console.log('POS ERROR HANDLER: ', message);
        onError?.(null, message);

        if (displayError) {
          displayAlert?.(message, 'error');
        }

        return message;
      } else {
        const resErrors = errors as unknown as IPOSValidationError[];

        for (const error of resErrors) {
          console.log('POS ERROR HANDLER: ', error.message);
          onError?.(error.field, (error.message as string) ?? 'Invalid input');
        }

        return resErrors[0].message
      }
    } catch (error: any) {
      const message = error?.message ?? 'Something went wrong. Please try again later.'
      displayAlert?.(message, 'error');

      return message;
    }
  }

  return errorHandler;
}

export default useErrorHandler;


