/* eslint-disable consistent-return */
import executeMinioBinary from "./data/binaries/minio";

const executeBinaries = () => {
  const minio = executeMinioBinary();

  const binaries = {
    minio,
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
