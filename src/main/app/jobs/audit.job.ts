import IJob from 'App/interfaces/job/job.interface';
import validator from 'App/modules/validator.module';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import { Job } from 'bullmq';

export default class AuditJob implements IJob {
  readonly key = 'AUDIT_JOB';

  async handler({ data }: Job) {
    try {
      const AuditTrailRepository = global.datasource.getRepository('audit_trails')
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
    await job?.remove?.();
  }

  async onFail(
    job: Job<any, IResponse<any>, string> | undefined,
    error: Error,
    prev: string
  ): Promise<void> {
    console.log('AUDIT JOB ERROR: ', error);
  }
}
