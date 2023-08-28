/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */
export default function objectToFlattenObject(obj: any): Record<string, any> {
  let result: Record<string, any> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const nested = objectToFlattenObject(obj[key]);
        result = { ...result, ...nested };
      } else {
        result[key] = obj[key];
      }
    }
  }

  return result;
}
