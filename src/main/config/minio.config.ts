const MinioConfig = {
  object_storage_access_key: process.env.MINIO_ACCESS_KEY ?? 'admin',
  object_storage_secret_key: process.env.MINIO_SECRET_KEY ?? 'password',
  object_storage_port: (process.env.MINIO_PORT as unknown as number) ?? 9000,
  object_storage_endpoint: process.env.MINIO_ENDPOINT ?? 'localhost',
};

export default MinioConfig;
