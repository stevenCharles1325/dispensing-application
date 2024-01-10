import { Bull } from "Main/jobs";

interface ChunkOptions {
  chunkSize?: number;
  processorName: string;
}

function chunkArray(array: any[], chunkSize: number = 5) {
  const result = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }

  return result;
}

export default async function chunkImport (
  list: any[],
  options: ChunkOptions
): Promise<void> {
  if (!list.length || !options.processorName?.length ) return;
  const chunkedList = chunkArray(list, options.chunkSize);
  const uploadId = Date.now();
  const length = chunkedList.length;

  for await (const [index, chunk] of chunkedList.entries()) {
    const isDone = length === index + 1;

    await Bull(
      options.processorName,
      {
        chunk,
        isDone,
        uploadId,
      }
    );
  }
}
