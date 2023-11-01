/* eslint-disable consistent-return */
import { platform } from 'os';
import dotenv from 'dotenv';
import AppRootDir from 'app-root-dir';
import { app } from 'electron';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

dotenv.config();

const getPlatform = () => {
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
const EXEC_PATH =
  IS_PROD && app.isPackaged
    ? `${AppRootDir.get()}/Contents/Assets/${getPlatform()}/bin`
    : `${AppRootDir.get()}/assets/object-storage/${getPlatform()}/bin`;

const executeBinaries = () => {
  const os = getPlatform();
  let cmd = '';
  let minioProcess: ChildProcessWithoutNullStreams | null = null;

  if (os === 'linux' || os === 'mac') {
    cmd = `chmod +x ${EXEC_PATH}/minio && sudo -S MINIO_ROOT_USER=${MINIO_USER} MINIO_ROOT_PASSWORD=${MINIO_PASSWORD} minio server /mnt/data --console-address ":${MINIO_PORT}"`;

    minioProcess = spawn('bash', ['-c', cmd]);
  }

  if (os === 'win') {
    cmd = `cd ${EXEC_PATH} && move ${EXEC_PATH}/minio C:\\minio && setx MINIO_ROOT_USER ${MINIO_USER} && setx MINIO_ROOT_PASSWORD ${MINIO_PASSWORD} && C:\\minio.exe server F:\\Data --console-address ":${MINIO_PORT}"`;

    minioProcess = spawn('cmd', ['/C', cmd]);
  }

  if (minioProcess) {
    minioProcess.stdout.on('data', (data) => {
      console.log('[STDOUT]: ----------------------');
      console.log(data.toString());
    });

    minioProcess.stderr.on('data', (data) => {
      console.log('[STDERR]: ----------------------');
      console.log(data.toString());
    });

    minioProcess.on('close', (code) => {
      console.log(`Minio process exited with code ${code}`);
    });
  }
};

export default executeBinaries;
