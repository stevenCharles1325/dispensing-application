import checkDiskSpace from 'check-disk-space';
import { app } from 'electron';

const convertBytesToMegabytes = (bytes: any) => {
  return bytes / (1024 * 1024);
}

const getAvailableDBSpace = async () => {
  const { free, size } = await checkDiskSpace(app.getAppPath())

  return {
    free: Number(convertBytesToMegabytes(free).toFixed(2)),
    size: Number(convertBytesToMegabytes(size).toFixed(2)),
    percentage: ((size - free) / size),
  }
}

export default getAvailableDBSpace;
