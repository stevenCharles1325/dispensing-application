import { DB_PATH } from 'Main/datasource';
import { app } from 'electron';
import { promisify } from 'util';
import { exec } from 'child_process';
import handleError from 'App/modules/error-handler.module';
import concatDateToName from 'App/modules/concat-date-to-name.module';
import path from 'path';
import { getPlatform } from 'App/modules/get-platform.module';
import AppRootDir from 'app-root-dir';

const IS_PROD = process.env.NODE_ENV === 'production';
const asyncExec = promisify(exec);

const EXEC_PATH = IS_PROD
  ? path.join(
      AppRootDir.get(),
      `../../assets/binaries/sqlite3/${getPlatform()}/bin`
    )
  : `${AppRootDir.get()}/assets/binaries/sqlite3/${getPlatform()}/bin`;

export default async function exportAsSQL() {
  const fileName = path.join(
    app.getPath('downloads'),
    `${
      concatDateToName('xgen_transaction_orders')
    }.sqlite`
  );

  const tableNames = [
    'images',
    'discounts',
    'brands',
    'categories',
    'items',
    'orders',
    'transactions'
  ];

  try {
    const platform = getPlatform();
    const sqlite = platform === 'win'
      ? '.\\sqlite3.exe'
      : 'sqlite3';

    if (platform === 'win') {
      const command =
        `cd "${EXEC_PATH}" && ${sqlite} ${DB_PATH} '.mode insert' '.dump ${
          tableNames.join(' ')
        }' > ${fileName}`;

      await asyncExec(command);

      return {
        data: { filePath: fileName },
        code: 'REQ_OK',
        status: 'SUCCESS',
      }
    } else {
      const command =
        `${sqlite} ${DB_PATH} '.mode insert' '.dump ${
          tableNames.join(' ')
        }' > ${fileName}`;

      await asyncExec(command);

      return {
        data: { filePath: fileName },
        code: 'REQ_OK',
        status: 'SUCCESS',
      }
    }
  } catch (err) {
    console.log(err);
    const error = handleError(err);

    return {
      errors: [error],
      code: 'REQ_ERR',
      status: 'ERROR',
    };
  }
}
