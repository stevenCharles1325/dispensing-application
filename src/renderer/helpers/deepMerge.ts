import isObject from "./isObject";

export default function deepMerge(target: any, source: any) {
  // Check if either target or source is not an object
  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  // Iterate over all keys in the source object
  for (const key in source) {
    // Check if the key is present in the target object
    if (target.hasOwnProperty(key)) {
      // If both values are objects, recursively merge them
      if (isObject(target[key]) && isObject(source[key])) {
        target[key] = deepMerge(target[key], source[key]);
      } else {
        // Otherwise, assign the value from the source to the target
        target[key] = source[key];
      }
    } else {
      // If the key is not present in the target object, simply add it
      target[key] = source[key];
    }
  }

  return target;
}
