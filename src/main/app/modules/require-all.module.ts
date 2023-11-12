/* eslint-disable no-else-return */
import path from 'path';
import _requireAll from 'require-all';
import { esmResolver } from './esm-resolver.module';
import { isScriptFile } from './is-script-file.module';

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
  context: __WebpackModuleApi.RequireContext | string,
  optional = false,
  filter: (file: string) => boolean = fileFilter
) {
  try {
    if (process.env.NODE_ENV === 'production') {
      const requestContext = context as __WebpackModuleApi.RequireContext;
      const files = requestContext.keys();

      const modules = files.reduce((acc: Record<string, any>, file: string) => {
        const resolved = esmResolver(requestContext(file));
        if (filter(file)) {
          const ext = path.extname(file);
          const paths = file.split('/');
          const fileName = paths[paths.length - 1];

          acc[fileName.replace(new RegExp(`${ext}$`), '')] = resolved;
        }
        return acc;
      }, {});

      return modules;
    } else {
      const location = context as string;
      return _requireAll({
        dirname: location,
        recursive: true,
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
    }
  } catch (error: any) {
    if (error.code !== 'ENOENT' && !optional) {
      throw error;
    }

    return null;
  }
}

export default requireAll;
