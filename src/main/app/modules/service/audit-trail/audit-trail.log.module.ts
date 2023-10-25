import AuditTrailDTO from 'App/data-transfer-objects/audit-trail.dto';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import AuditTrailRepository from 'App/repositories/audit-trail.repository';

export default async function log(
  this: any,
  info: Omit<AuditTrailDTO, 'id' | 'related' | 'user' | 'created_at'>
): Promise<IResponse<IPOSError | null>> {
  const audit = AuditTrailRepository.create(info);

  try {
    await AuditTrailRepository.save(audit);

    return {
      code: 'AUDIT_OK',
      status: 'error',
    } as unknown as IResponse<IPOSError>;
  } catch (err) {
    const errors = handleError(err);

    return {
      errors,
      code: 'AUDIT_ERR',
      status: 'error',
    } as unknown as IResponse<IPOSError>;
  }
}
