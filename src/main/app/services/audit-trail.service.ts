/* eslint-disable camelcase */
/* eslint-disable no-prototype-builtins */

import IAuditTrailService from 'App/interfaces/service/service.audit-trail.interface';

export default class AuditTrailService implements Partial<IAuditTrailService> {
  public readonly SERVICE_NAME: 'AUDIT_TRAIL';

  constructor() {}
}

Object.assign(AuditTrailService.prototype, {
});
