import IService from './service.interface';
import IResponse from '../pos/pos.response.interface';
import IPOSError from '../pos/pos.error.interface';
import AuditTrailDTO from 'App/data-transfer-objects/audit-trail.dto';

// type Create

/*
  Create a flow for an automated logging mechanism.

  Requirements:
    - Auto action detection (CREATE, UPDATE, DELETE).
    - Auto user detection (For peer-request and system-request).
    - Auto previous entity state detection
    - Non-blocking action (MUST)
*/

export default interface IAuditTrailService extends IService {
  log(
    this: any,
    info: Omit<AuditTrailDTO, 'id' | 'related' | 'user' | 'created_at'>
  ): Promise<IResponse<IPOSError | void>>;
}
