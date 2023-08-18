/* eslint-disable no-else-return */
import path from 'path';
import _requireAll from 'require-all';
import { esmResolver } from './esm-resolver';
import { isScriptFile } from './is-script-file';

/**
 * Function to filter and keep script files only
 */
function fileFilter(file: string): boolean {
  return isScriptFile(file);
}

/**
 * Require all files from a given directory. The method automatically looks
 * for files ending with `.ts`, `.js` and `.json`. Also files ending with
 * `.d.ts` are ignored.
 */
function requireAll(
  location: string,
  recursive = true,
  optional = false,
  filter: (file: string) => boolean = fileFilter
) {
  try {
    return _requireAll({
      dirname: location,
      recursive,
      filter: (file: string) => {
        let result = true;
        /**
         * Invoke user defined function
         */
        if (typeof filter === 'function') {
          result = filter(file);
        }
        /**
         * Use the default file name when file is meant to
         * be kept
         */
        if (result === true) {
          const ext = path.extname(file);
          return file.replace(new RegExp(`${ext}$`), '');
        }
        return result;
      },
      resolve: esmResolver,
    });
  } catch (error: any) {
    if (error.code !== 'ENOENT' && !optional) {
      throw error;
    }

    return null;
  }
}

export default requireAll;
