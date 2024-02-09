import getBinaryPath from 'App/modules/get-binary-path.module';
import { getPlatform } from 'App/modules/get-platform.module';
import { IBinaryOptions } from 'Main/binaries';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import dotenv from 'dotenv';
import { app } from 'electron';

dotenv.config();

const MINIO_USER = process.env.MINIO_USER ?? 'admin';
const MINIO_PASSWORD = process.env.MINIO_PASSWORD ?? 'password';
const MINIO_PORT = process.env.MINIO_PORT ?? 9001;

const EXEC_PATH = getBinaryPath('object-storage');

const executeMinioBinary = (option?: IBinaryOptions) => {
  try {
    console.log('[MINIO-BINARY]: Running minio-binary');
    const os = getPlatform();
    let cmd = '';
    let minioProcess: ChildProcessWithoutNullStreams | null = null;

    if (os === 'linux' || os === 'mac') {
      cmd = `chmod +x ${EXEC_PATH}/minio && sudo -S MINIO_ROOT_USER=${MINIO_USER} MINIO_ROOT_PASSWORD=${MINIO_PASSWORD} minio server /mnt/data --console-address ":${MINIO_PORT}"`;

      minioProcess = spawn('bash', ['-c', cmd]);
    }

    if (os === 'win') {
      cmd = `"setx MINIO_ROOT_USER ${MINIO_USER} && setx MINIO_ROOT_PASSWORD ${MINIO_PASSWORD} && cd "${EXEC_PATH}" && .\\minio.exe server "${app.getPath(
        'appData'
      )}" --console-address :${MINIO_PORT}"`;

      /*
        The /C option is to run command then terminate command prompt
      */
      minioProcess = spawn('cmd', ['/C', cmd], { shell: true });
    }

    if (minioProcess) {
      minioProcess.stdout.on('data', (data) => {
        console.log('[MINIO STDOUT]: ----------------------');
        console.log(data.toString());
      });

      minioProcess.stderr.on('data', (data) => {
        console.log('[MINIO STDERR]: ----------------------');
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
