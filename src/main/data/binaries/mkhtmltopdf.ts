import getBinaryPath from 'App/modules/get-binary-path.module';
import { getPlatform } from 'App/modules/get-platform.module';
import { IBinaryOptions } from 'Main/binaries';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

const MKHTMLTOPDF_KEY = 'MKHTMLTOPDF_STATUS';
const EXEC_PATH = getBinaryPath('pdfier');

const executeMKHTMLTOPDFBinary = (option?: IBinaryOptions) => {
  try {
    const mkhtmlStatus = option?.storage.get(MKHTMLTOPDF_KEY);

    if (!mkhtmlStatus || mkhtmlStatus === '0') {
      console.log('[MKHTMLTOPDF-BINARY]: Running mkht-binary');
      const os = getPlatform();
      let cmd = '';
      let mkhtmltopdfProcess: ChildProcessWithoutNullStreams | null = null;

      if (os === 'linux') {
        cmd = `"cd ${EXEC_PATH} && sudo apt install wkhtmltox_0.12.6.1-2.jammy_amd64.deb`;

        /*
          The /C option is to run command then terminate command prompt
        */
        mkhtmltopdfProcess = spawn('cmd', ['/C', cmd], { shell: true });
      }

      if (os === 'win') {
        cmd = `${EXEC_PATH}\\wkhtmltox.exe`;

        /*
          The /C option is to run command then terminate command prompt
        */
        mkhtmltopdfProcess = spawn('cmd', ['/C', cmd], { shell: true });
      }

      if (mkhtmltopdfProcess) {
        mkhtmltopdfProcess.stdout.on('data', (data) => {
          console.log('[MKHTML STDOUT]: ----------------------');
          console.log(data.toString());
        });

        mkhtmltopdfProcess.stderr.on('data', (data) => {
          console.log('[MKHTML STDERR]: ----------------------');
          console.log(data.toString());
        });

        mkhtmltopdfProcess.on('close', (code) => {
          console.log(`MKHTMLTOPDF process exited with code ${code}`);
        });

        option?.storage.set(MKHTMLTOPDF_KEY, '1');
        return mkhtmltopdfProcess;
      }
      console.log('[MKHTMLTOPDF-BINARY]: MKHTMLTOPDF binary ran successfully');
    }
  } catch (err) {
    console.log('[MKHTMLTOPDF-BINARY-ERROR]: ', err);
    option?.storage.set(MKHTMLTOPDF_KEY, '0');
    throw err;
  }
}

export default executeMKHTMLTOPDFBinary;
