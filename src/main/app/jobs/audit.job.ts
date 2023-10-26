import IJob from 'App/interfaces/job/job.interface';
import AuditTrailRepository from 'App/repositories/audit-trail.repository';
import validator from 'App/modules/validator.module';
import { Job } from 'bullmq';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import AuditTrailDTO from 'App/data-transfer-objects/audit-trail.dto';
import { AuditTrail } from 'Main/database/models/audit-trail.model';

export default class AuditJob implements IJob {
  readonly key = 'AUDIT_JOB';

  async handler({ data }: Job) {
    try {
      const audit = AuditTrailRepository.create(data);

      const errors = await validator(audit);
      if (errors && errors.length) {
        return Promise.reject(errors);
      }

      return await AuditTrailRepository.save(audit);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async onComplete(job: Job<any, IResponse<any>, string>): Promise<void> {
    console.log('JOB COMPLETED');
    await job.remove();
  }

  async onFail(
    job: Job<any, IResponse<any>, string> | undefined,
    error: Error,
    prev: string
  ): Promise<void> {
    console.log('AUDIT JOB ERROR: ', error);
  }
}
