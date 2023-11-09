/* eslint-disable consistent-return */
import { platform } from 'os';
import dotenv from 'dotenv';
import AppRootDir from 'app-root-dir';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import path from 'path';
import { app } from 'electron';

dotenv.config();

export const getPlatform = () => {
  switch (platform()) {
    case 'aix':
    case 'freebsd':
    case 'linux':
    case 'openbsd':
    case 'android':
      return 'linux';
    case 'darwin':
    case 'sunos':
      return 'mac';
    case 'win32':
      return 'win';
    default:
      return 'win';
  }
};

const MINIO_USER = process.env.MINIO_USER ?? 'admin';
const MINIO_PASSWORD = process.env.MINIO_PASSWORD ?? 'password';
const MINIO_PORT = process.env.MINIO_PORT ?? 9001;

const IS_PROD = process.env.NODE_ENV === 'production';
const EXEC_PATH = IS_PROD
  ? path.join(
      AppRootDir.get(),
      `../../assets/object-storage/${getPlatform()}/bin`
    )
  : `${AppRootDir.get()}/assets/object-storage/${getPlatform()}/bin`;

const executeBinaries = () => {
  try {
    console.log('[BINARIES]: Running binaries');
    const os = getPlatform();
    let cmd = '';
    let binaryProcess: ChildProcessWithoutNullStreams | null = null;

    if (os === 'linux' || os === 'mac') {
      cmd = `chmod +x ${EXEC_PATH}/minio && sudo -S MINIO_ROOT_USER=${MINIO_USER} MINIO_ROOT_PASSWORD=${MINIO_PASSWORD} minio server /mnt/data --console-address ":${MINIO_PORT}"`;

      console.log('COMMAND: ', cmd);
      binaryProcess = spawn('bash', ['-c', cmd]);
    }

    if (os === 'win') {
      cmd = `"setx MINIO_ROOT_USER ${MINIO_USER} && setx MINIO_ROOT_PASSWORD ${MINIO_PASSWORD} && cd "${EXEC_PATH}" && .\\minio.exe server "${app.getPath(
        'appData'
      )}" --console-address :${MINIO_PORT}"`;

      console.log('COMMAND: ', cmd);
      /*
        The /C option is to run command then terminate command prompt
      */
      binaryProcess = spawn('cmd', ['/C', cmd], { shell: true });
    }

    if (binaryProcess) {
      binaryProcess.stdout.on('data', (data) => {
        console.log('[STDOUT]: ----------------------');
        console.log(data.toString());
      });

      binaryProcess.stderr.on('data', (data) => {
        console.log('[STDERR]: ----------------------');
        console.log(data.toString());
      });

      binaryProcess.on('close', (code) => {
        console.log(`Minio process exited with code ${code}`);
      });

      return binaryProcess;
    }
    console.log('[BINARIES]: Binaries ran successfully');
  } catch (err) {
    console.log('[BINARIES-ERROR]: ', err);
    throw err;
  }
};

export default executeBinaries;
