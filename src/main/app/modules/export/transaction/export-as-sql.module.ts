import { DB_PATH } from 'Main/datasource';
import { app } from 'electron';
import { promisify } from 'util';
import { exec } from 'child_process';
import handleError from 'App/modules/error-handler.module';
import concatDateToName from 'App/modules/concatDateToName.module';

const asyncExec = promisify(exec);

export default async function exportAsSQL() {
  const fileName =
    app.getPath('downloads') + `/${
      concatDateToName('xgen_transaction_orders')
    }.sqlite`;
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
    const command =
      `sqlite3 ${DB_PATH} '.mode insert' '.dump ${
        tableNames.join(' ')
      }' > ${fileName}`;

    await asyncExec(command);

    return {
      data: { filePath: fileName },
      code: 'REQ_OK',
      status: 'SUCCESS',
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
