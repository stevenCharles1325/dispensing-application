import { ChildProcessWithoutNullStreams } from 'node:child_process';
import { DataSource } from 'typeorm';

declare global {
  var datasource: DataSource;
  var binaryProcess: ChildProcessWithoutNullStreams;
}

export {}
