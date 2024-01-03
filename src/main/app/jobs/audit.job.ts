import IJob from 'App/interfaces/job/job.interface';
import validator from 'App/modules/validator.module';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import { Job } from 'bullmq';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import Provider from '@IOC:Provider';
import UserDTO from 'App/data-transfer-objects/user.dto';

export default class AuditJob implements IJob {
  readonly key = 'AUDIT_JOB';

  async handler({ data }: Job) {
    try {
      const authService = Provider.ioc<IAuthService>('AuthProvider');
      const authResponse = authService.verifyToken(authService.getAuthToken()?.token);

      const user = authResponse.data as UserDTO;

      const AuditTrailRepository = global.datasource.getRepository('audit_trails')
      const audit = AuditTrailRepository.create({
        ...data,
        system_id: user.system_id,
      });

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
