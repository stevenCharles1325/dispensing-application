import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import { Token } from 'Main/database/models/token.model';
import { SqliteDataSource } from 'Main/datasource';

export default async function revoke(this: any) {
  const data = this.getStore(this.AUTH_USER);

  if (data) {
    try {
      const token = await SqliteDataSource.getRepository(Token);
      await token.delete({ user_id: data?.user?.id ?? data.id });

      this.clearStore();

      return {
        code: 'AUTH_OK',
        status: 'SUCCESS',
      } as IResponse;
    } catch (err) {
      const errors = handleError(err);
      console.log(errors);

      return {
        errors,
        code: 'SYS_ERR',
        status: 'ERROR',
      } as unknown as IResponse;
    }
  }

  return {
    errors: ['User is not authenticated'],
    code: 'AUTH_ERR',
    status: 'ERROR',
  } as IResponse;
}
