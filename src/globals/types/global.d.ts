import { ChildProcessWithoutNullStreams } from 'node:child_process';
import { DataSource } from 'typeorm';

declare global {
  var datasource: DataSource;
  var binaryProcesses: {
    binaries: Record<string, ChildProcessWithoutNullStreams | undefined>;
    killAll(): void;
  };
  function emitToRenderer(channel: string, data: any ): void;
}

export {}
