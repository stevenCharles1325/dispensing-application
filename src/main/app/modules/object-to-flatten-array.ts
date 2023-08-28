/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */
export default function objectToFlattenArray(obj: any): Array<[string, any]> {
  let result: Array<[string, any]> = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const nested = objectToFlattenArray(obj[key]);
        result = result.concat(nested);
      } else {
        result.push([key, obj[key]]);
      }
    }
  }

  return result;
}
