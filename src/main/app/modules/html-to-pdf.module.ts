import { exec } from "child_process";
import { promisify } from "util";
import { getPlatform } from "./get-platform.module";

const asyncExec = promisify(exec);

export default async function htmlToPDF(htmlPath: string, outputPath: string){
  const os = getPlatform();

  if (os === 'linux') {
    const {
      stdout,
      stderr
    } = await asyncExec(`wkhtmltopdf --margin-top 5mm --margin-bottom 0 --margin-right 0 --margin-left 0 ${
      htmlPath
    } ${
      outputPath
    }`);

    if (stdout) {
      console.log('[HTML-TO-PDF SUCCESS]: ', stdout);
      return;
    }

    if (stderr) {
      console.log('[HTML-TO-PDF ERROR]: ', stderr);
      return;
    }
  }

  if (os === 'win') {
    const {
      stdout,
      stderr
    } = await asyncExec(`"C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe" --margin-top 5mm --margin-bottom 0 --margin-right 0 --margin-left 0 --enable-local-file-access --load-error-handling ignore ${
      htmlPath
    } ${
      outputPath
    }`);

    if (stdout) {
      console.log('[HTML-TO-PDF SUCCESS]: ', stdout);
      return;
    }

    if (stderr) {
      console.log('[HTML-TO-PDF ERROR]: ', stderr);
      return;
    }
  }
}
