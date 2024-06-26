import IJob from 'App/interfaces/job/job.interface';
import validator from 'App/modules/validator.module';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import { Job } from 'bullmq';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import Provider from '@IOC:Provider';
import UserDTO from 'App/data-transfer-objects/user.dto';

export default class NotifJob implements IJob {
  readonly key = 'NOTIF_JOB';

  async handler({ data }: Job) {
    try {
      const authService = Provider.ioc<IAuthService>('AuthProvider');
      const token = authService.getAuthToken?.()?.token;
      const authResponse = authService.verifyToken(token);
      const user = authResponse.data as UserDTO;

      if (user.notification_status === 'on') {
        const NotificationRepository = global.datasource.getRepository('notifications')
        const notif = NotificationRepository.create(data);

        const errors = await validator(notif);
        if (errors && errors.length) {
          return Promise.reject(errors);
        }

        await NotificationRepository.save(notif);
        const unseenNotifs = await NotificationRepository.find({
          where: {
            status: 'UNSEEN',
          },
        })

        global.emitToRenderer('NOTIF:UNSEEN', unseenNotifs);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async onComplete(job: Job<any, IResponse<any>, string>): Promise<void> {
    console.log('NOTIF JOB COMPLETED');
    await job?.remove?.();
  }

  async onFail(
    job: Job<any, IResponse<any>, string> | undefined,
    error: Error,
    prev: string
  ): Promise<void> {
    console.log('NOTIF JOB ERROR: ', error);
  }
}
