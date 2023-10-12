const MinioConfig = {
  object_storage_client_access_key:
    process.env.MINIO_CLIENT_ACCESS_KEY ?? 'admin',

  object_storage_client_secret_key:
    process.env.MINIO_CLIENT_SECRET_KEY ?? 'password',

  object_storage_client_port: Number(process.env.MINIO_CLIENT_PORT) ?? 9000,

  object_storage_client_endpoint:
    process.env.MINIO_CLIENT_ENDPOINT ?? 'localhost',
};

export default MinioConfig;
