/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */

export function esmResolver<T>(output: T): T {
  return output && output.__esModule && output.default
    ? output.default
    : output;
}
