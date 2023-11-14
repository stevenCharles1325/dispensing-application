import checkDiskSpace from 'check-disk-space';
import { app } from 'electron';

const convertBytesToMegabytes = (bytes: any) => {
  return bytes / (1024 * 1024);
}

const getAvailableDBSpace = async () => {
  const IS_PROD = process.env.NODE_ENV === 'production';
  const DB_PATH = IS_PROD ? app.getPath('userData') : __dirname;
  const { free, size } = await checkDiskSpace(`${DB_PATH}/database/db.sqlite`)

  return {
    free: Number(convertBytesToMegabytes(free).toFixed(2)),
    size: Number(convertBytesToMegabytes(size).toFixed(2)),
    percentage: ((size - free) / size),
  }
}

export default getAvailableDBSpace;
