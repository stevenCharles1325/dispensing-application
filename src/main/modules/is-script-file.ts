/* eslint-disable import/prefer-default-export */
import { extname } from 'path';

const JS_MODULES = ['.js', '.json'];

/**
 * Returns `true` when file ends with `.js`, `.json` or
 * `.ts` but not `.d.ts`.
 */
export function isScriptFile(file: string): boolean {
  const ext = extname(file);
  if (JS_MODULES.includes(ext)) {
    return true;
  }
  if (ext === '.ts' && !file.endsWith('.d.ts')) {
    return true;
  }
  return false;
}
