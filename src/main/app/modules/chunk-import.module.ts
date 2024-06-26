import UploadRepository from "App/repositories/upload.repository";
import { Bull } from "Main/jobs";

interface ChunkOptions {
  chunkSize?: number;
  filePath: string;
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
  const total = list.length;
  const fileName = (
    options.filePath
      ?.replace(/\\/g, '/')
      ?.split?.('/')
      ?.reverse()
      ?.[0]
    ) ?? options.filePath;

  await UploadRepository.save({
    id: uploadId.toString(),
    total,
    file_name: fileName,
  });

  for await (const [index, chunk] of chunkedList.entries()) {
    const isLastChunk = chunkedList.length === index + 1;

    await Bull(
      options.processorName,
      {
        chunk,
        total,
        fileName,
        uploadId,
        isLastChunk,
      }
    );
  }
}
