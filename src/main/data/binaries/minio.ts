import { getPlatform } from 'App/modules/get-platform.module';
import AppRootDir from 'app-root-dir';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import dotenv from 'dotenv';
import { app } from 'electron';
import path from 'path';

dotenv.config();

const MINIO_USER = process.env.MINIO_USER ?? 'admin';
const MINIO_PASSWORD = process.env.MINIO_PASSWORD ?? 'password';
const MINIO_PORT = process.env.MINIO_PORT ?? 9001;

const IS_PROD = process.env.NODE_ENV === 'production';
const EXEC_PATH = IS_PROD
  ? path.join(
      AppRootDir.get(),
      `../../assets/binaries/object-storage/${getPlatform()}/bin`
    )
  : `${AppRootDir.get()}/assets/binaries/object-storage/${getPlatform()}/bin`;

const executeMinioBinary = () => {
  try {
    console.log('[MINIO-BINARY]: Running minio-binary');
    const os = getPlatform();
    let cmd = '';
    let minioProcess: ChildProcessWithoutNullStreams | null = null;

    if (os === 'linux' || os === 'mac') {
      cmd = `chmod +x ${EXEC_PATH}/minio && sudo -S MINIO_ROOT_USER=${MINIO_USER} MINIO_ROOT_PASSWORD=${MINIO_PASSWORD} minio server /mnt/data --console-address ":${MINIO_PORT}"`;

      console.log('COMMAND: ', cmd);
      minioProcess = spawn('bash', ['-c', cmd]);
    }

    if (os === 'win') {
      cmd = `"setx MINIO_ROOT_USER ${MINIO_USER} && setx MINIO_ROOT_PASSWORD ${MINIO_PASSWORD} && cd "${EXEC_PATH}" && .\\minio.exe server "${app.getPath(
        'appData'
      )}" --console-address :${MINIO_PORT}"`;

      console.log('COMMAND: ', cmd);
      /*
        The /C option is to run command then terminate command prompt
      */
      minioProcess = spawn('cmd', ['/C', cmd], { shell: true });
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

      return minioProcess;
    }
    console.log('[MINIO-BINARY]: Minio binary ran successfully');
  } catch (err) {
    console.log('[MINIO-BINARY-ERROR]: ', err);
    throw err;
  }
}

export default executeMinioBinary;
