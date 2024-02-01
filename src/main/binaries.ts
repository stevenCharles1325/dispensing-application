/* eslint-disable consistent-return */
import IStorage from "App/interfaces/storage/storage.interface";
import executeMinioBinary from "./data/binaries/minio";
import executeMKHTMLTOPDFBinary from "./data/binaries/mkhtmltopdf";

export interface IBinaryOptions {
  storage: IStorage;
}

const executeBinaries = (option?: IBinaryOptions) => {
  const minio = executeMinioBinary(option);
  const mkhtmltopdf = executeMKHTMLTOPDFBinary(option);

  const binaries = {
    minio,
    mkhtmltopdf
  };

  const killAll = () => {
    const list = Object.values(binaries);

    list.forEach((binary) => binary?.kill('SIGINT'));
  }

  return {
    binaries,
    killAll,
  }
};

export default executeBinaries;
