import { platform } from 'os';
import dotenv from 'dotenv';
import AppRootDir from 'app-root-dir';
import { app } from 'electron';
import { exec } from 'child_process';

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
    ? `${AppRootDir.get()}/Contents/Resources/bin`
    : `${AppRootDir.get()}/resources/${getPlatform()}/bin`;

const executeBinaries = () => {
  const os = getPlatform();
  let cmd = '';

  if (os === 'linux' || os === 'mac') {
    cmd = `chmod +x ${EXEC_PATH}/minio && sudo -S MINIO_ROOT_USER=${MINIO_USER} MINIO_ROOT_PASSWORD=${MINIO_PASSWORD} minio server /mnt/data --console-address ":${MINIO_PORT}"`;
  }

  if (os === 'win') {
    cmd = `cd ${EXEC_PATH} && move ${EXEC_PATH}/minio C:\\minio && setx MINIO_ROOT_USER ${MINIO_USER} && setx MINIO_ROOT_PASSWORD ${MINIO_PASSWORD} && C:\\minio.exe server F:\\Data --console-address ":${MINIO_PORT}"`;
  }

  return exec(cmd, (err, stdout, stderr) => {
    if (err) console.log('[EXEC ERROR]: ', err);
    if (stdout) console.log('[STDOUT]: ', stdout);
    if (stderr) console.log('[STDERR]: ', stderr);
  });
};

export default executeBinaries;
