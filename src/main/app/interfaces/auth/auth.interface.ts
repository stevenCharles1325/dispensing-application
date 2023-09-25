export default interface AuthContract<T> {
  token: string;
  refresh_token?: string;
  refresh_token_expires_at?: Date | string;
  token_expires_at?: Date | string;
  user: Awaited<Partial<T>>;
}
