import { exec } from 'child_process';
import { promisify } from 'util';
import { DB_PATH } from 'Main/datasource';
import handleError from 'App/modules/error-handler.module';

const asyncExec = promisify(exec);

export default async function importSQLDump (filePath: string) {
  try {
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
