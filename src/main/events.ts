import { join } from 'path';
import requireAll from './modules/require-all';

const events = requireAll(join(__dirname, 'events'), true);

type SearchObject = object | Function[] | object[];

function isFunctionArray(so: SearchObject): so is Array<Function> {
  return Array.isArray(so) && so.every((item) => typeof item === 'function');
}

function isObjectArray(so: SearchObject): so is Array<object> {
  return (
    Array.isArray(so) &&
    so.every((item) => typeof item === 'object' && item !== null)
  );
}

function isObject(value: any): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function findAndInvokeFunctions(so: SearchObject): null {
  if (!so) return null;

  if (isFunctionArray(so)) {
    console.log(`[RUNNING ALL ${so.length} IPCMAIN EVENT-HANDLERS]: Success`);
    so.forEach((func) => func());
    return null;
  }

  if (isObjectArray(so)) {
    so.forEach((item) => findAndInvokeFunctions(Object.values(item)));
    return null;
  }

  if (isObject(so)) {
    return findAndInvokeFunctions(Object.values(so));
  }

  return null;
}

export default function () {
  if (events) {
    findAndInvokeFunctions(events);
  }
}
