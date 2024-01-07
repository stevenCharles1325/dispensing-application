import { exec } from 'child_process';
import { promisify } from 'util';
import { DB_PATH, IS_PROD } from 'Main/datasource';
import handleError from 'App/modules/error-handler.module';
import { getPlatform } from 'App/modules/get-platform.module';
import AppRootDir from 'app-root-dir';
import path from 'path';

const asyncExec = promisify(exec);

const EXEC_PATH = IS_PROD
  ? path.join(
      AppRootDir.get(),
      `../../assets/binaries/sqlite3/${getPlatform()}/bin`
    )
  : `${AppRootDir.get()}/assets/binaries/sqlite3/${getPlatform()}/bin`;

export default async function importSQLDump (filePath: string) {
  try {
    const platform = getPlatform();
    const sqlite = platform === 'win'
      ? '.\\sqlite3.exe'
      : 'sqlite3';

    if (platform === 'win') {
      const command = `cd "${EXEC_PATH}" && ${sqlite} ${DB_PATH} < ${filePath}`;
      const result = await asyncExec(command);

      if (result.stderr.length) {
        const error = handleError(result.stderr);

        return {
          errors: [error],
          code: 'REQ_ERR',
          status: 'ERROR',
        };
      }

      return {
        code: 'REQ_OK',
        status: 'SUCCESS',
      };
    } else {
      const command = `sqlite3 ${DB_PATH} < ${filePath}`;
      const result = await asyncExec(command);

      if (result.stderr.length) {
        const error = handleError(result.stderr);

        return {
          errors: [error],
          code: 'REQ_ERR',
          status: 'ERROR',
        };
      }

      return {
        code: 'REQ_OK',
        status: 'SUCCESS',
      };
    }
  } catch (err) {
    const error = handleError(err);

    return {
      errors: [
        {
          code: 'REQ_ERR',
          message: 'Error occurred! Might be because some data already exist.',
          verbose: error,
        }
      ],
      code: 'REQ_ERR',
      status: 'ERROR',
    };
  }
}
