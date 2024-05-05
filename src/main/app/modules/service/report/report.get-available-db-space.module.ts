import { DB_PATH } from 'Main/datasource';
import checkDiskSpace from 'check-disk-space';

const convertBytesToMegabytes = (bytes: any) => {
  return bytes / (1024 * 1024);
}

const getAvailableDBSpace = async () => {
  try {
    const { free, size } = await checkDiskSpace(DB_PATH);

    return {
      free: Number(convertBytesToMegabytes(free).toFixed(2)),
      size: Number(convertBytesToMegabytes(size).toFixed(2)),
      percentage: ((size - free) / size),
    }
  } catch (err) {
    console.log(`[DISK SPACE CHECK ERROR]: ${err}`);

    throw new Error(`[DISK SPACE CHECK ERROR]: ${err}`);
  }
}

export default getAvailableDBSpace;
